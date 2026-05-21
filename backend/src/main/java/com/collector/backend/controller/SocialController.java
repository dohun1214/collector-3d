package com.collector.backend.controller;

import com.collector.backend.dto.*;
import com.collector.backend.service.SocialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;

    // ---- Likes ----

    @PostMapping("/api/items/{id}/like")
    public ResponseEntity<LikeResponse> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(socialService.toggleLike(id, userDetails.getUsername()));
    }

    // ---- Saves ----

    @PostMapping("/api/items/{id}/save")
    public ResponseEntity<SaveResponse> toggleSave(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(socialService.toggleSave(id, userDetails.getUsername()));
    }

    @GetMapping("/api/items/saved")
    public ResponseEntity<List<ItemSummary>> getSavedItems(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(socialService.getSavedItems(userDetails.getUsername()));
    }

    // ---- Comments ----

    @GetMapping("/api/items/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(socialService.getComments(id));
    }

    @PostMapping("/api/items/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @RequestBody @Valid CommentCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(socialService.addComment(id, request.content(), userDetails.getUsername()));
    }

    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        socialService.deleteComment(commentId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
