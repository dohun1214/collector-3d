package com.collector.backend.controller;

import com.collector.backend.dto.*;
import com.collector.backend.service.FileUploadService;
import com.collector.backend.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final FileUploadService fileUploadService;

    @GetMapping
    public ResponseEntity<Page<ItemSummary>> getItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(itemService.getPublicItems(keyword, categoryId, sort, page, size));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItemSummary>> getMyItems(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(itemService.getMyItems(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(itemService.getItem(id, email));
    }

    @PostMapping
    public ResponseEntity<ItemResponse> createItem(
            @RequestBody @Valid ItemCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemService.createItem(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable Long id,
            @RequestBody @Valid ItemUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(itemService.updateItem(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        itemService.deleteItem(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<JobResponse> uploadFiles(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        // saveFiles: 파일 저장 + DB 기록 + Job 생성 (트랜잭션)
        JobResponse job = fileUploadService.saveFiles(id, files, email);
        // triggerAiProcessing: 트랜잭션 커밋 후 AI 서버 호출 (트랜잭션 밖)
        fileUploadService.triggerAiProcessing(id);
        return ResponseEntity.accepted().body(job);
    }

    @GetMapping("/{id}/job")
    public ResponseEntity<JobResponse> getJobStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(itemService.getJobStatus(id, userDetails.getUsername()));
    }
}
