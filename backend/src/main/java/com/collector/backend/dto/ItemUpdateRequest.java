package com.collector.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ItemUpdateRequest(
        @NotBlank(message = "아이템 이름은 필수입니다")
        @Size(max = 255, message = "아이템 이름은 255자 이하여야 합니다")
        String title,

        String description,
        Long categoryId,
        Boolean isPublic
) {}
