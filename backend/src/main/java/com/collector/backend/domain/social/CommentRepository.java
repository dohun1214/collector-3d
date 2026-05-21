package com.collector.backend.domain.social;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findAllByItem_IdOrderByCreatedAtAsc(Long itemId);

    long countByItem_Id(Long itemId);

    boolean existsByIdAndUser_Email(Long id, String email);
}
