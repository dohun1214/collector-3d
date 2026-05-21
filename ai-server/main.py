import asyncio
import logging
import sys
from contextlib import asynccontextmanager
from typing import List

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

from processor import JobProcessor

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")

processor = JobProcessor()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 앱 시작 시 백그라운드 워커 실행
    task = asyncio.create_task(processor.worker())
    yield
    task.cancel()


app = FastAPI(title="3D Collector AI Server", version="1.0.0", lifespan=lifespan)


# ── Request / Response Models ─────────────────────────────────────────────────

class ProcessRequest(BaseModel):
    item_id: int
    file_type: str          # VIDEO | IMAGE
    file_paths: List[str]
    callback_url: str


class ProcessResponse(BaseModel):
    status: str
    message: str
    queue_size: int


class HealthResponse(BaseModel):
    status: str
    queue_size: int


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/process", response_model=ProcessResponse, status_code=status.HTTP_202_ACCEPTED)
async def process_item(request: ProcessRequest):
    """3DGS 처리 요청 — 큐에 등록 후 즉시 반환."""
    if not request.file_paths:
        raise HTTPException(status_code=400, detail="file_paths가 비어 있습니다.")
    if request.file_type not in ("VIDEO", "IMAGE"):
        raise HTTPException(status_code=400, detail="file_type은 VIDEO 또는 IMAGE여야 합니다.")

    await processor.enqueue(request.model_dump())
    return ProcessResponse(
        status="queued",
        message=f"item_id={request.item_id} 처리 대기열에 추가됨",
        queue_size=processor.queue.qsize(),
    )


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", queue_size=processor.queue.qsize())
