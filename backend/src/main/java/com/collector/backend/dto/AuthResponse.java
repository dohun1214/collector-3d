package com.collector.backend.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        String nickname
) {}
