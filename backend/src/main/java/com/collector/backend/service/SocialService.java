package com.collector.backend.service;

import com.collector.backend.domain.item.*;
import com.collector.backend.domain.social.Comment;
import com.collector.backend.domain.social.CommentRepository;
import com.collector.backend.domain.user.User;
import com.collector.backend.domain.user.UserRepository;
import com.collector.backend.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final ItemRepository itemRepository;
    private final ItemLikeRepository itemLikeRepository;
    private final ItemSaveRepository itemSaveRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Transactional
    public LikeResponse toggleLike(Long itemId, String email) {
        Item item = findItemById(itemId);

        if (itemLikeRepository.existsByUser_EmailAndItem_Id(email, itemId)) {
            itemLikeRepository.deleteByUser_EmailAndItem_Id(email, itemId);
            long count = itemLikeRepository.countByItem_Id(itemId);
            return new LikeResponse(false, count);
        } else {
            User user = findUserByEmail(email);
            ItemLike like = ItemLike.builder()
                    .user(user)
                    .item(item)
                    .build();
            itemLikeRepository.save(like);
            long count = itemLikeRepository.countByItem_Id(itemId);
            return new LikeResponse(true, count);
        }
    }

    @Transactional
    public SaveResponse toggleSave(Long itemId, String email) {
        Item item = findItemById(itemId);

        if (itemSaveRepository.existsByUser_EmailAndItem_Id(email, itemId)) {
            itemSaveRepository.deleteByUser_EmailAndItem_Id(email, itemId);
            long count = itemSaveRepository.countByItem_Id(itemId);
            return new SaveResponse(false, count);
        } else {
            User user = findUserByEmail(email);
            ItemSave save = ItemSave.builder()
                    .user(user)
                    .item(item)
                    .build();
            itemSaveRepository.save(save);
            long count = itemSaveRepository.countByItem_Id(itemId);
            return new SaveResponse(true, count);
        }
    }

    @Transactional
    public CommentResponse addComment(Long itemId, String content, String email) {
        Item item = findItemById(itemId);
        User user = findUserByEmail(email);

        Comment comment = Comment.builder()
                .item(item)
                .user(user)
                .content(content)
                .build();
        return CommentResponse.from(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long commentId, String email) {
        if (!commentRepository.existsByIdAndUser_Email(commentId, email)) {
            throw new AccessDeniedException("댓글을 삭제할 권한이 없습니다.");
        }
        commentRepository.deleteById(commentId);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long itemId) {
        return commentRepository.findAllByItem_IdOrderByCreatedAtAsc(itemId).stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ItemSummary> getSavedItems(String email) {
        return itemSaveRepository.findAllByUser_EmailOrderByCreatedAtDesc(email).stream()
                .map(itemSave -> ItemSummary.from(itemSave.getItem()))
                .toList();
    }

    private Item findItemById(Long itemId) {
        return itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("아이템을 찾을 수 없습니다."));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
    }
}
