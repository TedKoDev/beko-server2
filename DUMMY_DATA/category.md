-- 1:1 Inquiry Categories
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '1:1 Inquiry'), 'Grammar Consultation', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 Inquiry'), 'Writing Feedback', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 Inquiry'), 'Pronunciation Correction', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 Inquiry'), 'Learning Consultation', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 Inquiry'), 'Other Consultations', NOW(), NULL, NULL);

-- Korean Language Learning Categories
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Language Learning'), 'Grammar', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Language Learning'), 'Vocabulary', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Language Learning'), 'Pronunciation', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Language Learning'), 'Writing', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Language Learning'), 'Speaking', NOW(), NULL, NULL);

-- Korean Culture Categories
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Culture'), 'K-POP', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Culture'), 'Movies/Drama', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Culture'), 'Food', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Culture'), 'Traditional Culture', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Korean Culture'), 'Everyday Culture', NOW(), NULL, NULL);

-- Community Categories
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = 'Community'), 'Free Board', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Community'), 'Find Friends', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Community'), 'Study Group Recruitment', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Community'), 'Korea Living Information', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Community'), 'Experience Sharing', NOW(), NULL, NULL);

<!-- -- category 테이블에 더미 데이터 삽입

-- 1:1 문의 카테고리
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '문법 상담', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '작문 첨삭', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '발음 교정', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '학습 상담', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '기타 상담', NOW(), NULL, NULL);

-- 한국어 학습 카테고리
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '문법', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '어휘', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '발음', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '쓰기', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '말하기', NOW(), NULL, NULL);

-- 한국 문화 카테고리
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), 'K-POP', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), '영화/드라마', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), '음식', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), '전통문화', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), '생활문화', NOW(), NULL, NULL);

-- 커뮤니티 카테고리
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '자유게시판', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '친구찾기', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '스터디모집', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '한국생활정보', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '경험공유', NOW(), NULL, NULL); -->
