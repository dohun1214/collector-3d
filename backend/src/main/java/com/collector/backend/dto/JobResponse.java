package com.collector.backend.dto;

import com.collector.backend.domain.item.Job;
import com.collector.backend.domain.item.JobStatus;

import java.time.LocalDateTime;

public record JobResponse(
        Long id,
        Long itemId,
        JobStatus status,
        String errorMessage,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        int progress
) {
    public static JobResponse from(Job job) {
        return new JobResponse(
                job.getId(),
                job.getItem().getId(),
                job.getStatus(),
                job.getErrorMessage(),
                job.getStartedAt(),
                job.getFinishedAt(),
                job.getProgress()
        );
    }
}
