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
        LocalDateTime createdAt
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
                item.getCreatedAt()
        );
    }
}
