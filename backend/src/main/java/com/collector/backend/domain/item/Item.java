package com.collector.backend.domain.item;

import com.collector.backend.domain.category.Category;
import com.collector.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Column(name = "ply_path", length = 500)
    private String plyPath;

    @Column(name = "thumbnail_path", length = 500)
    private String thumbnailPath;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Item(User user, Category category, String title, String description, Boolean isPublic) {
        this.user = user;
        this.category = category;
        this.title = title;
        this.description = description;
        this.isPublic = isPublic != null ? isPublic : true;
    }

    public void update(String title, String description, Category category, Boolean isPublic) {
        this.title = title;
        this.description = description;
        this.category = category;
        if (isPublic != null) this.isPublic = isPublic;
    }

    public void setPlyPath(String plyPath) {
        this.plyPath = plyPath;
    }

    public void setThumbnailPath(String thumbnailPath) {
        this.thumbnailPath = thumbnailPath;
    }

    public void incrementViewCount() {
        this.viewCount++;
    }
}
