-- Простой SQL скрипт для привязки нод к области "Республика Коми"
-- Выполнить напрямую в БД, если не нужна миграция
-- ВАЖНО: Убедитесь, что страна и область уже созданы!

-- Вариант 1: Если страна и область уже существуют, просто привязываем ноды
UPDATE "Node"
SET "path_area_id" = (
    SELECT pa."id"
    FROM "path_area" pa
    INNER JOIN "country" c ON pa."country_id" = c."id"
    WHERE pa."name" = 'Республика Коми'
      AND c."name" = 'Российская Федерация'
    LIMIT 1
)
WHERE "path_area_id" IS NULL;

-- Проверка результата
SELECT 
    COUNT(*) as total_nodes,
    COUNT("path_area_id") as nodes_with_area,
    COUNT(*) - COUNT("path_area_id") as nodes_without_area
FROM "Node";

-- Проверка количества нод в области "Республика Коми"
SELECT 
    pa."name" as area_name,
    c."name" as country_name,
    COUNT(n."id") as nodes_count
FROM "path_area" pa
INNER JOIN "country" c ON pa."country_id" = c."id"
LEFT JOIN "Node" n ON n."path_area_id" = pa."id"
WHERE pa."name" = 'Республика Коми'
  AND c."name" = 'Российская Федерация'
GROUP BY pa."name", c."name";

