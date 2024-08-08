-- topic 테이블에 더미 데이터 삽입
-- category 테이블에 더미 데이터 삽입
-- sql문 그냥 넣고 돌리면 됨

INSERT INTO public."topic" (title, created_at, updated_at, deleted_at) VALUES
('Brewing Methods', NOW(), NULL, NULL),
('Coffee Beans', NOW(), NULL, NULL),
('Coffee Equipment', NOW(), NULL, NULL),
('Coffee Culture', NOW(), NULL, NULL),
('Coffee Recipes', NOW(), NULL, NULL);

INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = 'Brewing Methods'), 'Espresso', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Brewing Methods'), 'French Press', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Brewing Methods'), 'Pour Over', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Beans'), 'Arabica', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Beans'), 'Robusta', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Equipment'), 'Grinders', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Equipment'), 'Espresso Machines', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Culture'), 'History', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Culture'), 'Trends', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Recipes'), 'Iced Coffee', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Recipes'), 'Coffee Cocktails', NOW(), NULL, NULL);
