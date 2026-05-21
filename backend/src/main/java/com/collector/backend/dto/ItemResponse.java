package com.collector.backend.dto;

import com.collector.backend.domain.item.Item;

import java.time.LocalDateTime;

public record ItemResponse(
        Long id,
        String title,
        String description,
        Long categoryId,
        String categoryName,
        Boolean isPublic,
        String plyPath,
        String thumbnailPath,
        Long authorId,
        String authorNickname,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        int viewCount,
        long likeCount,
        long commentCount,
        long saveCount,
        boolean isLiked,
        boolean isSaved
) {
    public static ItemResponse from(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getCategory() != null ? item.getCategory().getId() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getIsPublic(),
                item.getPlyPath(),
                item.getThumbnailPath(),
                item.getUser().getId(),
                item.getUser().getNickname(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                item.getViewCount(),
                0L,
                0L,
                0L,
                false,
                false
        );
    }

    public static ItemResponse fromWithSocial(Item item,
                                              long likeCount,
                                              long commentCount,
                                              long saveCount,
                                              boolean isLiked,
                                              boolean isSaved) {
        return new ItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getCategory() != null ? item.getCategory().getId() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getIsPublic(),
                item.getPlyPath(),
                item.getThumbnailPath(),
                item.getUser().getId(),
                item.getUser().getNickname(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                item.getViewCount(),
                likeCount,
                commentCount,
                saveCount,
                isLiked,
                isSaved
        );
    }
}
