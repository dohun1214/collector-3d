package com.collector.backend.service;

import com.collector.backend.domain.category.Category;
import com.collector.backend.domain.category.CategoryRepository;
import com.collector.backend.domain.item.*;
import com.collector.backend.domain.user.User;
import com.collector.backend.domain.user.UserRepository;
import com.collector.backend.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemService {

    @Value("${uploads.base-path}")
    private String basePath;

    private final ItemRepository itemRepository;
    private final ItemFileRepository itemFileRepository;
    private final JobRepository jobRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ItemSummary> getPublicItems(String keyword, Long categoryId, Pageable pageable) {
        String kw = (keyword != null && keyword.isBlank()) ? null : keyword;
        return itemRepository.findPublicItems(kw, categoryId, pageable)
                .map(ItemSummary::from);
    }

    @Transactional(readOnly = true)
    public ItemResponse getItem(Long id, String requesterEmail) {
        Item item = findItemById(id);
        if (!item.getIsPublic()) {
            if (requesterEmail == null || !requesterEmail.equals(item.getUser().getEmail())) {
                throw new AccessDeniedException("비공개 아이템입니다.");
            }
        }
        return ItemResponse.from(item);
    }

    @Transactional
    public ItemResponse createItem(ItemCreateRequest request, String email) {
        User user = findUserByEmail(email);
        Category category = resolveCategory(request.categoryId());

        Item item = Item.builder()
                .user(user)
                .category(category)
                .title(request.title())
                .description(request.description())
                .isPublic(request.isPublic())
                .build();
        return ItemResponse.from(itemRepository.save(item));
    }

    @Transactional
    public ItemResponse updateItem(Long id, ItemUpdateRequest request, String email) {
        Item item = findItemById(id);
        checkOwner(item, email);
        Category category = resolveCategory(request.categoryId());
        item.update(request.title(), request.description(), category, request.isPublic());
        return ItemResponse.from(item);
    }

    @Transactional
    public void deleteItem(Long id, String email) {
        Item item = findItemById(id);
        checkOwner(item, email);
        itemFileRepository.deleteAllByItemId(id);
        jobRepository.findByItemId(id).ifPresent(jobRepository::delete);
        itemRepository.delete(item);
        deleteItemDirectories(id);
    }

    @Transactional(readOnly = true)
    public List<ItemSummary> getMyItems(String email) {
        return itemRepository.findAllByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(ItemSummary::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobResponse getJobStatus(Long itemId, String email) {
        Item item = findItemById(itemId);
        checkOwner(item, email);
        Job job = jobRepository.findByItemId(itemId)
                .orElseThrow(() -> new NoSuchElementException("3DGS 작업이 존재하지 않습니다."));
        return JobResponse.from(job);
    }

    private Item findItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("아이템을 찾을 수 없습니다."));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));
    }

    @Transactional
    public void handleAiCallback(AiCallbackRequest request) {
        Job job = jobRepository.findByItemId(request.itemId())
                .orElseThrow(() -> new NoSuchElementException("작업을 찾을 수 없습니다."));

        if (Boolean.TRUE.equals(request.success())) {
            job.updateStatus(JobStatus.DONE, null);
            Item item = findItemById(request.itemId());
            item.setPlyPath(request.plyPath());
            if (request.thumbnailPath() != null) {
                item.setThumbnailPath(request.thumbnailPath());
            }
        } else {
            job.updateStatus(JobStatus.FAILED, request.errorMessage());
        }
    }

    private void checkOwner(Item item, String email) {
        if (!item.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
    }

    private void deleteItemDirectories(Long id) {
        String[] subDirs = {"images", "videos", "thumbnails", "frames", "colmap", "ply"};
        for (String sub : subDirs) {
            Path dir = Paths.get(basePath).toAbsolutePath().resolve(sub).resolve(String.valueOf(id));
            if (Files.exists(dir)) {
                try {
                    Files.walkFileTree(dir, new SimpleFileVisitor<>() {
                        @Override
                        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                            Files.delete(file);
                            return FileVisitResult.CONTINUE;
                        }
                        @Override
                        public FileVisitResult postVisitDirectory(Path d, IOException e) throws IOException {
                            Files.delete(d);
                            return FileVisitResult.CONTINUE;
                        }
                    });
                    log.info("Deleted directory: {}", dir);
                } catch (IOException e) {
                    log.warn("Failed to delete directory: {}, error: {}", dir, e.getMessage());
                }
            }
        }
    }
}
