package com.collector.backend.controller;

import com.collector.backend.domain.item.ItemLikeRepository;
import com.collector.backend.domain.item.ItemRepository;
import com.collector.backend.domain.user.User;
import com.collector.backend.domain.user.UserRepository;
import com.collector.backend.dto.ItemSummary;
import com.collector.backend.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ItemLikeRepository itemLikeRepository;

    @GetMapping("/{nickname}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable String nickname) {
        User user = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        long itemCount = itemRepository.countPublicItemsByNickname(nickname);
        long totalLikes = itemLikeRepository.countByItem_User_Nickname(nickname);
        long totalViews = itemRepository.sumViewCountByNickname(nickname);

        return ResponseEntity.ok(UserProfileResponse.of(user, itemCount, totalLikes, totalViews));
    }

    @Transactional(readOnly = true)
    @GetMapping("/{nickname}/items")
    public ResponseEntity<Page<ItemSummary>> getUserItems(
            @PathVariable String nickname,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ItemSummary> items = itemRepository
                .findPublicItemsByUserNickname(nickname, PageRequest.of(page, size))
                .map(ItemSummary::from);
        return ResponseEntity.ok(items);
    }
}
