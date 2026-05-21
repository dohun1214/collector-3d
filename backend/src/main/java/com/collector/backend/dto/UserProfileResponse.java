package com.collector.backend.dto;

import com.collector.backend.domain.user.User;

import java.time.LocalDateTime;

public record UserProfileResponse(
        Long id,
        String nickname,
        LocalDateTime joinedAt,
        long itemCount,
        long totalLikes,
        long totalViews
) {
    public static UserProfileResponse of(User user, long itemCount, long totalLikes, long totalViews) {
        return new UserProfileResponse(
                user.getId(),
                user.getNickname(),
                user.getCreatedAt(),
                itemCount,
                totalLikes,
                totalViews
        );
    }
}
