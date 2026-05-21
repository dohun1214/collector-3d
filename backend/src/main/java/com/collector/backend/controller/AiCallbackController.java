package com.collector.backend.controller;

import com.collector.backend.dto.AiCallbackRequest;
import com.collector.backend.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class AiCallbackController {

    private final ItemService itemService;

    @Value("${internal.api-key}")
    private String internalApiKey;

    @PostMapping("/callback")
    public ResponseEntity<Void> handleCallback(
            @RequestHeader("X-Internal-Key") String apiKey,
            @RequestBody AiCallbackRequest request) {

        if (!internalApiKey.equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("AI 콜백 수신 - itemId: {}, success: {}", request.itemId(), request.success());
        itemService.handleAiCallback(request);
        return ResponseEntity.ok().build();
    }

}
