# 3D Collector - 프로젝트 가이드

## 프로젝트 개요
피규어, 레고, 굿즈 등 소장품을 영상/사진으로 찍어 3D로 저장하고 공유하는 플랫폼.
사용자가 물건을 촬영한 영상 또는 사진을 업로드하면, 3D Gaussian Splatting(3DGS) 기술로
3D 모델(PLY 파일)을 자동 생성하고 웹에서 바로 감상할 수 있다.

---

## 프로젝트 구조
```
3d-collector/
├── CLAUDE.md
├── backend/        # Spring Boot 3 (IntelliJ)
├── ai-server/      # Python FastAPI + 3DGS 파이프라인 (VSCode)
└── frontend/       # React + TypeScript (VSCode)
```

---

## 기술 스택

### 백엔드 (backend/)
- Java 17
- Spring Boot 3
- Spring Security + JWT 인증
- Spring Data JPA
- MySQL 8
- Gradle

### AI 서버 (ai-server/)
- Python 3.10+
- FastAPI
- FFmpeg (영상 → 프레임 추출)
- COLMAP (카메라 포즈 추정, SfM)
- gsplat (3DGS 학습 → PLY 파일 생성)
- GPU: RTX 4060 Ti 8GB (로컬)

### 프론트엔드 (frontend/)
- React 18
- TypeScript
- Spark 라이브러리 (PLY 파일 3D 렌더링)
- Axios (API 통신)

---

## 사용자 역할
- 단일 역할 (누구나 가입 후 등록 + 감상 가능)
- 별도 관리자 없음

---

## 기능 목록

### 인증
- 회원가입 / 로그인 / 로그아웃
- JWT Access Token 기반 인증
- 비로그인 사용자는 공개 아이템 열람만 가능

### 아이템 등록
- 아이템 이름, 설명, 카테고리 입력
- 영상(mp4) 또는 사진(jpg/png) 다중 업로드
- 업로드 후 ai-server로 3DGS 생성 요청
- 작업 상태 폴링으로 확인 (PENDING → PROCESSING → DONE / FAILED)

### 3DGS 파이프라인 (ai-server)
- 영상 입력 시: FFmpeg으로 프레임 추출
- 사진 입력 시: 바로 다음 단계로
- COLMAP으로 카메라 포즈 추정
- gsplat으로 3DGS 학습 → PLY 파일 생성
- 완료 후 PLY 파일 경로를 backend에 콜백

### 3D 뷰어
- Spark 라이브러리로 PLY 파일 렌더링
- 360도 회전, 줌 지원
- 공유 링크(/items/{id})로 비로그인 접근 가능

### 목록 / 검색
- 전체 공개 아이템 피드
- 카테고리 필터
- 아이템 이름 검색

### 마이페이지
- 내가 등록한 아이템 목록 (공개/비공개 포함)
- 아이템 수정 / 삭제

### 공유
- 아이템별 고유 링크: /items/{id}
- 비로그인 사용자도 접근 가능 (공개 아이템만)
- 링크 열면 3D 뷰어 바로 노출

### 공개/비공개
- 아이템 등록 시 공개 여부 설정
- 비공개 아이템은 본인만 열람 가능

---

## DB 스키마 (MySQL)

### users
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| email | VARCHAR(255) UNIQUE | 로그인 ID |
| password | VARCHAR(255) | BCrypt 암호화 |
| nickname | VARCHAR(100) | 표시 이름 |
| created_at | DATETIME | |

### categories
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| name | VARCHAR(100) | 피규어, 레고, 굿즈 등 |

### items
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK | 등록한 유저 |
| category_id | BIGINT FK | 카테고리 |
| title | VARCHAR(255) | 아이템 이름 |
| description | TEXT | 설명 |
| is_public | BOOLEAN DEFAULT true | 공개/비공개 |
| ply_path | VARCHAR(500) | 완성된 PLY 파일 경로 |
| thumbnail_path | VARCHAR(500) | 썸네일 이미지 경로 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### jobs
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| item_id | BIGINT FK | 연결된 아이템 |
| status | ENUM | PENDING / PROCESSING / DONE / FAILED |
| error_message | TEXT | 실패 시 에러 내용 |
| started_at | DATETIME | |
| finished_at | DATETIME | |

### files
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| item_id | BIGINT FK | 연결된 아이템 |
| file_type | ENUM | VIDEO / IMAGE |
| file_path | VARCHAR(500) | 로컬 저장 경로 |
| created_at | DATETIME | |

### 카테고리 초기 데이터
피규어, 레고, 건담, 굿즈, 다이캐스트, 미니카, 아트토이, 스포츠카드,
한정판 스니커즈, 빈티지 장난감, 애니메이션 굿즈, 게임 피규어,
마블 피규어, DC 피규어, 포켓몬, 스타워즈, 기타

---

## API 설계

### 인증
| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|---|---|---|---|
| POST | /api/auth/signup | 회원가입 | ❌ |
| POST | /api/auth/login | 로그인 | ❌ |
| POST | /api/auth/logout | 로그아웃 | ✅ |

### 아이템
| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|---|---|---|---|
| GET | /api/items | 전체 공개 아이템 목록 | ❌ |
| GET | /api/items/{id} | 아이템 상세 (공개 or 본인) | ❌ |
| POST | /api/items | 아이템 등록 | ✅ |
| PUT | /api/items/{id} | 아이템 수정 | ✅ |
| DELETE | /api/items/{id} | 아이템 삭제 | ✅ |
| GET | /api/items/my | 내 아이템 목록 | ✅ |

### 파일 업로드
| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|---|---|---|---|
| POST | /api/items/{id}/upload | 영상/사진 업로드 | ✅ |

### 작업 상태
| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|---|---|---|---|
| GET | /api/items/{id}/job | 3DGS 작업 상태 조회 | ✅ |

### 카테고리
| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|---|---|---|---|
| GET | /api/categories | 카테고리 목록 | ❌ |

---

## Spring Boot ↔ AI 서버 연동 방식

1. 사용자가 파일 업로드 완료
2. Spring Boot가 ai-server로 HTTP POST 요청
   - 전달: item_id, 파일 경로 목록, 파일 타입(VIDEO/IMAGE)
3. ai-server가 작업 큐에 등록 후 즉시 응답 (비동기)
4. ai-server가 백그라운드에서 파이프라인 실행
   - 영상: FFmpeg 프레임 추출 → COLMAP → gsplat
   - 사진: COLMAP → gsplat
5. 완료 시 ai-server가 Spring Boot로 콜백 HTTP POST
   - 전달: item_id, ply_path, 성공/실패 여부

---

## 파일 저장 경로 규칙
```
uploads/
├── videos/{item_id}/         # 업로드된 영상
├── images/{item_id}/         # 업로드된 사진
├── frames/{item_id}/         # FFmpeg 추출 프레임
├── colmap/{item_id}/         # COLMAP 결과
├── ply/{item_id}/            # 최종 PLY 파일
└── thumbnails/{item_id}/     # 썸네일 이미지
```

---

## 개발 순서
1. backend/ - Spring Boot 프로젝트 세팅 (DB 연결, JPA, Security, JWT)
2. backend/ - 인증 API 개발 (회원가입, 로그인)
3. backend/ - 아이템 CRUD API 개발
4. backend/ - 파일 업로드 API 개발
5. ai-server/ - FastAPI 세팅
6. ai-server/ - FFmpeg + COLMAP + gsplat 파이프라인 구현
7. backend/ - ai-server 연동 (HTTP 요청/콜백)
8. frontend/ - React 프로젝트 세팅
9. frontend/ - 인증 페이지 (로그인, 회원가입)
10. frontend/ - 아이템 목록/검색 페이지
11. frontend/ - 아이템 등록 페이지 (파일 업로드)
12. frontend/ - 3D 뷰어 페이지 (Spark)
13. frontend/ - 마이페이지

---

## 주의사항
- ai-server는 한 번에 하나의 3DGS 작업만 처리 (GPU 메모리 한계)
- 동시 요청은 큐에서 순차 처리
- PLY 파일은 용량이 크므로 (100~300MB) 스트리밍 방식으로 프론트에 전달
- COLMAP 실행 시간: 수십 초 ~ 수 분
- gsplat 학습 시간: RTX 4060 Ti 기준 5~15분 (씬 복잡도에 따라)