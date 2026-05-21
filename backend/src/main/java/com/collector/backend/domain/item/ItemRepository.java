package com.collector.backend.domain.item;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query(value = """
            SELECT i FROM Item i
            WHERE i.isPublic = true
            AND (:keyword IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
            AND (:categoryId IS NULL OR i.category.id = :categoryId)
            """,
           countQuery = """
            SELECT COUNT(i) FROM Item i
            WHERE i.isPublic = true
            AND (:keyword IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
            AND (:categoryId IS NULL OR i.category.id = :categoryId)
            """)
    Page<Item> findPublicItems(@Param("keyword") String keyword,
                               @Param("categoryId") Long categoryId,
                               Pageable pageable);

    @Query(value = """
            SELECT i FROM Item i
            WHERE i.isPublic = true
            AND (:keyword IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
            AND (:categoryId IS NULL OR i.category.id = :categoryId)
            ORDER BY (SELECT COUNT(il) FROM ItemLike il WHERE il.item = i) DESC
            """,
           countQuery = """
            SELECT COUNT(i) FROM Item i
            WHERE i.isPublic = true
            AND (:keyword IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
            AND (:categoryId IS NULL OR i.category.id = :categoryId)
            """)
    Page<Item> findPublicItemsOrderByLikes(@Param("keyword") String keyword,
                                           @Param("categoryId") Long categoryId,
                                           Pageable pageable);

    List<Item> findAllByUserEmailOrderByCreatedAtDesc(String email);

    @Query("SELECT i FROM Item i WHERE i.user.nickname = :nickname AND i.isPublic = true ORDER BY i.createdAt DESC")
    Page<Item> findPublicItemsByUserNickname(@Param("nickname") String nickname, Pageable pageable);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.user.nickname = :nickname AND i.isPublic = true")
    long countPublicItemsByNickname(@Param("nickname") String nickname);

    @Query("SELECT COALESCE(SUM(i.viewCount), 0) FROM Item i WHERE i.user.nickname = :nickname AND i.isPublic = true")
    long sumViewCountByNickname(@Param("nickname") String nickname);
}
