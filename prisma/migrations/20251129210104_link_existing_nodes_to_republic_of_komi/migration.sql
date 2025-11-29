-- Миграция для привязки существующих нод к области "Республика Коми"
-- Идемпотентная: можно запускать несколько раз безопасно

-- Включаем расширение для генерации UUID (если нужно)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    country_id_val TEXT;
    area_id_val TEXT;
    nodes_updated INTEGER;
BEGIN
    -- Шаг 1: Получаем или создаем страну "Российская Федерация"
    SELECT "id" INTO country_id_val
    FROM "country"
    WHERE "name" = 'Российская Федерация'
    LIMIT 1;

    -- Если страна не существует, создаем её
    IF country_id_val IS NULL THEN
        INSERT INTO "country" ("id", "name", "code", "created_at", "updated_at")
        VALUES (
            gen_random_uuid()::text,
            'Российская Федерация',
            'RU',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING "id" INTO country_id_val;
        
        RAISE NOTICE 'Создана страна "Российская Федерация" с ID: %', country_id_val;
    ELSE
        RAISE NOTICE 'Страна "Российская Федерация" уже существует с ID: %', country_id_val;
    END IF;

    -- Шаг 2: Получаем или создаем область "Республика Коми"
    SELECT "id" INTO area_id_val
    FROM "path_area"
    WHERE "name" = 'Республика Коми'
      AND "country_id" = country_id_val
    LIMIT 1;

    -- Если область не существует, создаем её
    IF area_id_val IS NULL THEN
        INSERT INTO "path_area" ("id", "name", "country_id", "created_at", "updated_at")
        VALUES (
            gen_random_uuid()::text,
            'Республика Коми',
            country_id_val,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING "id" INTO area_id_val;
        
        RAISE NOTICE 'Создана область "Республика Коми" с ID: %', area_id_val;
    ELSE
        RAISE NOTICE 'Область "Республика Коми" уже существует с ID: %', area_id_val;
    END IF;

    -- Шаг 3: Привязываем все ноды с NULL path_area_id к области "Республика Коми"
    UPDATE "Node"
    SET "path_area_id" = area_id_val
    WHERE "path_area_id" IS NULL;
    
    GET DIAGNOSTICS nodes_updated = ROW_COUNT;
    
    RAISE NOTICE 'Привязано нод к области "Республика Коми": %', nodes_updated;

    -- Проверка: если область не найдена и есть ноды для привязки, выбросить ошибку
    IF area_id_val IS NULL THEN
        SELECT COUNT(*) INTO nodes_updated
        FROM "Node"
        WHERE "path_area_id" IS NULL;
        
        IF nodes_updated > 0 THEN
            RAISE EXCEPTION 'Область "Республика Коми" не найдена. Невозможно привязать % нод(ы).', nodes_updated;
        END IF;
    END IF;
END $$;

-- Финальная проверка: все ли ноды привязаны
DO $$
DECLARE
    nodes_without_area INTEGER;
BEGIN
    SELECT COUNT(*) INTO nodes_without_area
    FROM "Node"
    WHERE "path_area_id" IS NULL;
    
    IF nodes_without_area > 0 THEN
        RAISE WARNING 'Внимание: осталось % нод(ы) без привязки к области', nodes_without_area;
    ELSE
        RAISE NOTICE 'Все ноды успешно привязаны к области';
    END IF;
END $$;
