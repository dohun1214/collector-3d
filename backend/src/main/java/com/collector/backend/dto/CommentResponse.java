package com.collector.backend.dto;

import com.collector.backend.domain.social.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long itemId,
        Long authorId,
        String authorNickname,
        String content,
        LocalDateTime createdAt
) {
    public static CommentResponse from(Comment c) {
        return new CommentResponse(
                c.getId(),
                c.getItem().getId(),
                c.getUser().getId(),
                c.getUser().getNickname(),
                c.getContent(),
                c.getCreatedAt()
        );
    }
}
