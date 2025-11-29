-- AlterEnum: добавить AREA_CHANGE в ActionType (в начале, до использования в транзакции)
ALTER TYPE "ActionType" ADD VALUE 'AREA_CHANGE';

-- CreateTable: создание таблицы Country
CREATE TABLE "country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: уникальный индекс на code
CREATE UNIQUE INDEX "country_code_key" ON "country"("code");

-- CreateTable: создание таблицы PathArea
CREATE TABLE "path_area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "path_area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: индекс на country_id для оптимизации запросов
CREATE INDEX "path_area_country_id_idx" ON "path_area"("country_id");

-- AddForeignKey: внешний ключ от path_area к country
ALTER TABLE "path_area" ADD CONSTRAINT "path_area_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: добавление поля path_area_id в таблицу Node
-- Примечание: поле опциональное (nullable) для обратной совместимости
ALTER TABLE "Node" ADD COLUMN "path_area_id" TEXT;

-- CreateIndex: индекс на path_area_id для оптимизации запросов
CREATE INDEX "Node_path_area_id_idx" ON "Node"("path_area_id");

-- AddForeignKey: внешний ключ от Node к path_area
-- onDelete: SetNull - при удалении области ноды не удаляются, только обнуляется pathAreaId
ALTER TABLE "Node" ADD CONSTRAINT "Node_path_area_id_fkey" FOREIGN KEY ("path_area_id") REFERENCES "path_area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
