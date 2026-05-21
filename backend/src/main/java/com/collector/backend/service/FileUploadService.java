package com.collector.backend.service;

import com.collector.backend.domain.item.*;
import com.collector.backend.domain.user.User;
import com.collector.backend.domain.user.UserRepository;
import com.collector.backend.dto.JobResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final ItemRepository itemRepository;
    private final ItemFileRepository itemFileRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .build();

    @Value("${uploads.base-path}")
    private String basePath;

    @Value("${ai.server.url}")
    private String aiServerUrl;

    @Value("${ai.server.callback-url}")
    private String callbackUrl;

    private static final Set<String> VIDEO_EXTENSIONS = Set.of("mp4", "mov", "avi");
    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png");
    private static final int MAX_FILES = 200;

    @Transactional
    public JobResponse saveFiles(Long itemId, MultipartFile[] files, String email) {
        Item item = findAndCheckOwner(itemId, email);

        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("파일을 선택해주세요.");
        }
        if (files.length > MAX_FILES) {
            throw new IllegalArgumentException("파일은 최대 " + MAX_FILES + "개까지 업로드 가능합니다.");
        }

        // 처리 중인 작업이 있으면 거부
        jobRepository.findByItemId(itemId).ifPresent(job -> {
            if (job.getStatus() == JobStatus.PENDING || job.getStatus() == JobStatus.PROCESSING) {
                throw new IllegalStateException("이미 처리 중인 작업이 있습니다. 완료 후 재시도해주세요.");
            }
        });

        FileType fileType = determineFileType(files);
        validateExtensions(files, fileType);

        // 기존 파일 레코드 삭제 후 재업로드
        itemFileRepository.deleteAllByItemId(itemId);

        // 파일 저장
        List<String> savedPaths = saveFilesToDisk(itemId, files, fileType);

        // ItemFile 레코드 저장
        for (String path : savedPaths) {
            itemFileRepository.save(ItemFile.builder()
                    .item(item).fileType(fileType).filePath(path).build());
        }

        // Job 생성 or 재시작
        Job job = jobRepository.findByItemId(itemId)
                .map(existing -> { existing.reset(); return existing; })
                .orElseGet(() -> jobRepository.save(Job.builder().item(item).build()));

        return JobResponse.from(job);
    }

    // 트랜잭션 외부에서 호출 — DB 커밋 후 AI 서버에 요청
    public void triggerAiProcessing(Long itemId) {
        List<ItemFile> files = itemFileRepository.findAllByItemId(itemId);
        if (files.isEmpty()) {
            markJobFailed(itemId, "저장된 파일이 없습니다.");
            return;
        }
        String fileType = files.get(0).getFileType().name();
        List<String> paths = files.stream()
                .map(f -> Paths.get(f.getFilePath()).toAbsolutePath().toString())
                .toList();

        String pathsJson = paths.stream()
                .map(p -> "\"" + p.replace("\\", "\\\\") + "\"")
                .collect(Collectors.joining(",", "[", "]"));
        String json = String.format(
                "{\"item_id\":%d,\"file_type\":\"%s\",\"file_paths\":%s,\"callback_url\":\"%s\"}",
                itemId, fileType, pathsJson, callbackUrl);
        log.info("AI 서버 요청 body: {}", json);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServerUrl + "/process"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
            }
            log.info("AI 서버 요청 성공 - itemId: {}", itemId);
        } catch (Exception e) {
            log.error("AI 서버 요청 실패 - itemId: {}, error: {}", itemId, e.getMessage());
            markJobFailed(itemId, "AI 서버 연결 실패: " + e.getMessage());
        }
    }

    @Transactional
    public void markJobFailed(Long itemId, String errorMessage) {
        jobRepository.findByItemId(itemId).ifPresent(job ->
                job.updateStatus(JobStatus.FAILED, errorMessage));
    }

    private List<String> saveFilesToDisk(Long itemId, MultipartFile[] files, FileType fileType) {
        String subDir = fileType == FileType.VIDEO ? "videos" : "images";
        Path dir = Paths.get(basePath, subDir, String.valueOf(itemId));
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new RuntimeException("업로드 디렉토리 생성 실패", e);
        }

        List<String> paths = new ArrayList<>();
        for (MultipartFile file : files) {
            String originalName = Objects.requireNonNull(file.getOriginalFilename());
            String safeName = System.currentTimeMillis() + "_" + originalName.replaceAll("[^a-zA-Z0-9._\\-]", "_");
            Path target = dir.resolve(safeName);
            try {
                Files.copy(file.getInputStream(), target);
            } catch (IOException e) {
                throw new RuntimeException("파일 저장 실패: " + originalName, e);
            }
            paths.add(target.toString());
        }
        return paths;
    }

    private void saveThumbnail(Item item, Long itemId, MultipartFile file) {
        String ext = getExtension(file.getOriginalFilename());
        Path thumbDir = Paths.get(basePath, "thumbnails", String.valueOf(itemId));
        try {
            Files.createDirectories(thumbDir);
            Path target = thumbDir.resolve("thumbnail." + ext);
            Files.copy(file.getInputStream(), target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            item.setThumbnailPath("thumbnails/" + itemId + "/thumbnail." + ext);
        } catch (IOException e) {
            log.warn("썸네일 저장 실패 - itemId: {}, error: {}", itemId, e.getMessage());
        }
    }

    private FileType determineFileType(MultipartFile[] files) {
        for (MultipartFile file : files) {
            String ext = getExtension(file.getOriginalFilename());
            if (VIDEO_EXTENSIONS.contains(ext)) return FileType.VIDEO;
        }
        return FileType.IMAGE;
    }

    private void validateExtensions(MultipartFile[] files, FileType fileType) {
        Set<String> allowed = fileType == FileType.VIDEO ? VIDEO_EXTENSIONS : IMAGE_EXTENSIONS;
        for (MultipartFile file : files) {
            String ext = getExtension(file.getOriginalFilename());
            if (!allowed.contains(ext)) {
                throw new IllegalArgumentException("허용되지 않는 파일 형식입니다: " + file.getOriginalFilename());
            }
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private Item findAndCheckOwner(Long itemId, String email) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("아이템을 찾을 수 없습니다."));
        if (!item.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
        return item;
    }
}
