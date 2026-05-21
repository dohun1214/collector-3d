import asyncio
import logging
import subprocess
import sys
from pathlib import Path

import httpx

from config import settings

logger = logging.getLogger(__name__)


class JobProcessor:
    """GPU 메모리 한계로 단일 작업 큐 사용 — 순차 처리."""

    def __init__(self):
        self.queue: asyncio.Queue = asyncio.Queue()

    async def enqueue(self, request: dict):
        await self.queue.put(request)
        logger.info("Job queued: item_id=%s, queue_size=%d", request["item_id"], self.queue.qsize())

    async def worker(self):
        logger.info("Job worker started")
        while True:
            request = await self.queue.get()
            item_id = request["item_id"]
            try:
                logger.info("Processing started: item_id=%s", item_id)
                ply_path, thumbnail_path = await self._run_pipeline(request)
                await self._send_callback(request["callback_url"], item_id, True, str(ply_path), str(thumbnail_path) if thumbnail_path else None, None)
                logger.info("Processing done: item_id=%s, ply=%s", item_id, ply_path)
            except Exception as e:
                logger.exception("Processing failed: item_id=%s", item_id)
                await self._send_callback(request["callback_url"], item_id, False, None, None, str(e))
            finally:
                self.queue.task_done()

    async def _run_pipeline(self, request: dict) -> Path:
        item_id = request["item_id"]
        file_type = request["file_type"]  # VIDEO | IMAGE
        file_paths = request["file_paths"]
        base = Path(settings.uploads_base_path)

        # ── Step 1: 프레임 추출 (영상인 경우) ──────────────────────────────
        if file_type == "VIDEO":
            frames_dir = base / "frames" / str(item_id)
            frames_dir.mkdir(parents=True, exist_ok=True)
            await self._ffmpeg_extract(file_paths[0], frames_dir)
            image_dir = frames_dir
        else:
            image_dir = Path(file_paths[0]).parent

        # ── Step 2: COLMAP SfM ────────────────────────────────────────────
        colmap_dir = base / "colmap" / str(item_id)
        colmap_dir.mkdir(parents=True, exist_ok=True)
        await self._run_colmap(image_dir, colmap_dir)

        # simple_trainer은 data_dir/images/ 폴더가 필요 — 없으면 복사
        colmap_images_dir = colmap_dir / "images"
        if not colmap_images_dir.exists():
            import shutil
            shutil.copytree(str(image_dir), str(colmap_images_dir))

        # gsplat --data-factor 2 용 절반 해상도 이미지 폴더 생성
        await self._create_downscaled_images(colmap_images_dir, 2)

        # ── Step 3: 3DGS 학습 ─────────────────────────────────────────────
        ply_dir = base / "ply" / str(item_id)
        ply_dir.mkdir(parents=True, exist_ok=True)
        ply_path = await self._run_gsplat(colmap_dir, ply_dir, item_id)

        return ply_path

    async def _ffmpeg_extract(self, video_path: str, output_dir: Path):
        cmd = [
            "ffmpeg", "-i", video_path,
            "-vf", f"fps={settings.ffmpeg_fps}",
            "-q:v", "2",
            str(output_dir / "frame_%04d.jpg"),
            "-y",
        ]
        await self._exec(cmd, "FFmpeg 프레임 추출")

    async def _run_colmap(self, image_dir: Path, workspace: Path):
        db = str(workspace / "database.db")

        colmap = settings.colmap_executable

        await self._exec([
            colmap, "feature_extractor",
            "--database_path", db,
            "--image_path", str(image_dir),
            "--ImageReader.single_camera", "1",
        ], "COLMAP feature_extractor")

        await self._exec([
            colmap, "exhaustive_matcher",
            "--database_path", db,
        ], "COLMAP exhaustive_matcher")

        sparse = workspace / "sparse"
        sparse.mkdir(exist_ok=True)
        await self._exec([
            colmap, "mapper",
            "--database_path", db,
            "--image_path", str(image_dir),
            "--output_path", str(sparse),
        ], "COLMAP mapper")

    async def _run_gsplat(self, colmap_dir: Path, output_dir: Path, item_id: int) -> Path:
        trainer = Path(__file__).parent / "simple_trainer.py"
        cmd = [
            sys.executable, "-u", str(trainer), "default",
            "--disable-viewer",
            "--save-ply",
            "--data-dir", str(colmap_dir),
            "--data-factor", "2",
            "--result-dir", str(output_dir),
            "--max-steps", str(settings.max_gsplat_steps),
            "--render-traj-path", "ellipse",
        ]

        await self._exec(cmd, "gsplat 학습")

        ply_files = sorted(output_dir.glob("**/*.ply"))
        if not ply_files:
            raise RuntimeError("PLY 파일이 생성되지 않았습니다.")
        base = Path(settings.uploads_base_path).resolve()
        ply_rel = Path(ply_files[0].resolve().relative_to(base).as_posix())

        # renders/ 폴더의 첫 번째 이미지를 썸네일로 사용
        render_files = sorted(output_dir.glob("renders/*.png")) + sorted(output_dir.glob("renders/*.jpg"))
        thumbnail_rel = Path(render_files[0].resolve().relative_to(base).as_posix()) if render_files else None

        return ply_rel, thumbnail_rel

    @staticmethod
    async def _create_downscaled_images(src_dir: Path, factor: int):
        from PIL import Image as PILImage
        dst_dir = src_dir.parent / f"images_{factor}"
        dst_dir.mkdir(exist_ok=True)
        exts = {'.jpg', '.jpeg', '.png'}
        for img_path in src_dir.iterdir():
            if img_path.suffix.lower() in exts:
                img = PILImage.open(img_path)
                new_size = (img.width // factor, img.height // factor)
                img.resize(new_size, PILImage.LANCZOS).save(dst_dir / img_path.name)
        logger.info("Downscaled images to factor %d in %s", factor, dst_dir)

    @staticmethod
    async def _exec(cmd: list, label: str):
        final_cmd = [str(c) for c in cmd]
        if final_cmd and final_cmd[0].lower().endswith(".bat"):
            final_cmd = ["cmd", "/c"] + final_cmd
        logger.info("[%s] 실행: %s", label, " ".join(final_cmd))

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: subprocess.run(final_cmd, capture_output=True),
        )
        if result.returncode != 0:
            raise RuntimeError(
                f"[{label}] 실패 (exit {result.returncode})\n{result.stderr.decode(errors='replace')}"
            )

    @staticmethod
    async def _send_callback(url: str, item_id: int, success: bool, ply_path, thumbnail_path, error_message):
        payload = {
            "itemId": item_id,
            "success": success,
            "plyPath": ply_path,
            "thumbnailPath": thumbnail_path,
            "errorMessage": error_message,
        }
        headers = {"X-Internal-Key": settings.backend_internal_key}
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                logger.info("Callback sent: item_id=%s", item_id)
        except Exception as e:
            logger.error("Callback failed: item_id=%s, error=%s", item_id, e)
