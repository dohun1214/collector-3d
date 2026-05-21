package com.collector.backend.dto;

import com.collector.backend.domain.item.Item;

import java.time.LocalDateTime;

public record ItemSummary(
        Long id,
        String title,
        Long categoryId,
        String categoryName,
        Boolean isPublic,
        String thumbnailPath,
        Long authorId,
        String authorNickname,
        LocalDateTime createdAt,
        int viewCount,
        long likeCount,
        long commentCount
) {
    public static ItemSummary from(Item item) {
        return new ItemSummary(
                item.getId(),
                item.getTitle(),
                item.getCategory() != null ? item.getCategory().getId() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getIsPublic(),
                item.getThumbnailPath(),
                item.getUser().getId(),
                item.getUser().getNickname(),
                item.getCreatedAt(),
                item.getViewCount(),
                0L,
                0L
        );
    }

    public static ItemSummary fromWithCounts(Item item, long viewCount, long likeCount, long commentCount) {
        return new ItemSummary(
                item.getId(),
                item.getTitle(),
                item.getCategory() != null ? item.getCategory().getId() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getIsPublic(),
                item.getThumbnailPath(),
                item.getUser().getId(),
                item.getUser().getNickname(),
                item.getCreatedAt(),
                (int) viewCount,
                likeCount,
                commentCount
        );
    }
}
