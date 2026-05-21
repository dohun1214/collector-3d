package com.collector.backend.domain.item;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemSaveRepository extends JpaRepository<ItemSave, Long> {

    Optional<ItemSave> findByUser_EmailAndItem_Id(String email, Long itemId);

    long countByItem_Id(Long itemId);

    boolean existsByUser_EmailAndItem_Id(String email, Long itemId);

    void deleteByUser_EmailAndItem_Id(String email, Long itemId);

    List<ItemSave> findAllByUser_EmailOrderByCreatedAtDesc(String email);
}
