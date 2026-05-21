package com.collector.backend.domain.item;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemLikeRepository extends JpaRepository<ItemLike, Long> {

    Optional<ItemLike> findByUser_EmailAndItem_Id(String email, Long itemId);

    long countByItem_Id(Long itemId);

    boolean existsByUser_EmailAndItem_Id(String email, Long itemId);

    void deleteByUser_EmailAndItem_Id(String email, Long itemId);

    long countByItem_User_Nickname(String nickname);
}
