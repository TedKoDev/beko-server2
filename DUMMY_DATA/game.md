-- 게임 타입 삽입
INSERT INTO "GameType" (name, description)
VALUES ('ImageGame', 'A game where you choose the right Korean word after looking at the image');

-- 게임 문제 삽입 (기본 레벨 1로 설정)
INSERT INTO "GameQuestion" (game_type_id, image_url, answer, options, level)
VALUES
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EA%B0%80%EB%B0%A9.webp',
'가방',
ARRAY['가방', '책', '의자', '물'],
1
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%ED%95%99%EA%B5%90.webp',
'학교',
ARRAY['학교', '가방', '의자', '책'],
1
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EC%B1%85.webp',
'책',
ARRAY['책', '가방', '물', '밥'],
1
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EB%AC%BC.webp',
'물',
ARRAY['물', '밥', '책', '의자'],
1
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EB%B0%A5.webp',
'밥',
ARRAY['밥', '물', '책', '가방'],
1
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EC%9D%98%EC%9E%90.webp',
'의자',
ARRAY['의자', '책', '가방', '학교'],
1
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EA%B0%80%EB%8B%A4.webp',
'가다',
ARRAY['가다', '오다', '먹다', '자다'],
2
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EC%98%A4%EB%8B%A4.webp',
'오다',
ARRAY['오다', '가다', '자다', '먹다'],
2
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EB%A8%B9%EB%8B%A4.webp',
'먹다',
ARRAY['먹다', '자다', '가다', '오다'],
2
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EC%9E%90%EB%8B%A4.webp',
'자다',
ARRAY['자다', '먹다', '가다', '오다'],
2
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%ED%81%AC%EB%8B%A4.webp',
'크다',
ARRAY['크다', '작다', '덥다', '춥다'],
3
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EC%9E%91%EB%8B%A4.webp',
'작다',
ARRAY['작다', '크다', '덥다', '춥다'],
3
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%ED%9A%A1%EB%8B%A8%EB%B3%B4%EB%8F%84.webp',
'횡단보도',
ARRAY['횡단보도', '학교', '의자', '책'],
3
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EB%8D%A5%EB%8B%A4.webp',
'덥다',
ARRAY['덥다', '춥다', '크다', '작다'],
3
),
(
1,
'https://beko-s3.s3.amazonaws.com/imagematchinggame/%EC%B6%A5%EB%8B%A4.webp',
'춥다',
ARRAY['춥다', '덥다', '크다', '작다'],
3
);
