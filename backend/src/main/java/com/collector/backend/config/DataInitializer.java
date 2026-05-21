package com.collector.backend.config;

import com.collector.backend.domain.category.Category;
import com.collector.backend.domain.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final CategoryRepository categoryRepository;

    private static final List<String> CATEGORIES = List.of(
            "피규어", "레고", "건담", "굿즈", "다이캐스트", "미니카",
            "아트토이", "스포츠카드", "한정판 스니커즈", "빈티지 장난감",
            "애니메이션 굿즈", "게임 피규어", "마블 피규어", "DC 피규어",
            "포켓몬", "스타워즈", "기타"
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        CATEGORIES.forEach(name -> {
            if (!categoryRepository.existsByName(name)) {
                categoryRepository.save(Category.builder().name(name).build());
            }
        });
    }
}
