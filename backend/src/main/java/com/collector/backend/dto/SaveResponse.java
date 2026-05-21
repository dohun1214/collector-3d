package com.collector.backend.dto;

public record SaveResponse(
        boolean saved,
        long saveCount
) {
}
