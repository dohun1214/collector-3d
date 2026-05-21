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
        LocalDateTime updatedAt
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
                item.getUpdatedAt()
        );
    }
}
