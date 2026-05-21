package com.collector.backend.dto;

public record LikeResponse(
        boolean liked,
        long likeCount
) {
}
