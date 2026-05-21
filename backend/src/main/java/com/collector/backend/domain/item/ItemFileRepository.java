package com.collector.backend.domain.item;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemFileRepository extends JpaRepository<ItemFile, Long> {
    List<ItemFile> findAllByItemId(Long itemId);
    void deleteAllByItemId(Long itemId);
}
