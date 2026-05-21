package com.collector.backend.dto;

public record AiCallbackRequest(
        Long itemId,
        Boolean success,
        String plyPath,
        String thumbnailPath,
        String errorMessage
) {}
