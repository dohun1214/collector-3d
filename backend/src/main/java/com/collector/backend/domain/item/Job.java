package com.collector.backend.domain.item;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.PENDING;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    private int progress = 0;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Builder
    public Job(Item item) {
        this.item = item;
        this.status = JobStatus.PENDING;
    }

    public void updateStatus(JobStatus status, String errorMessage) {
        this.status = status;
        this.errorMessage = errorMessage;
        if (status == JobStatus.PROCESSING) {
            this.startedAt = LocalDateTime.now();
        } else if (status == JobStatus.DONE || status == JobStatus.FAILED) {
            this.finishedAt = LocalDateTime.now();
        }
    }

    public void updateProgress(int progress) {
        this.progress = progress;
    }

    public void reset() {
        this.status = JobStatus.PENDING;
        this.errorMessage = null;
        this.startedAt = null;
        this.finishedAt = null;
        this.progress = 0;
    }
}
