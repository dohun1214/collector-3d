package com.collector.backend.domain.item;

import com.collector.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "item_likes",
        uniqueConstraints = @UniqueConstraint(name = "uq_item_likes_user_item", columnNames = {"user_id", "item_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public ItemLike(User user, Item item) {
        this.user = user;
        this.item = item;
    }
}
