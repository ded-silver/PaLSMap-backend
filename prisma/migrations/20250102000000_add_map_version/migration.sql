-- CreateTable
CREATE TABLE "map_version" (
    "id" TEXT NOT NULL,
    "path_area_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "map_version_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "map_version_path_area_id_idx" ON "map_version"("path_area_id");

-- CreateIndex
CREATE INDEX "map_version_created_at_idx" ON "map_version"("created_at");

-- AddForeignKey
ALTER TABLE "map_version" ADD CONSTRAINT "map_version_path_area_id_fkey" FOREIGN KEY ("path_area_id") REFERENCES "path_area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_version" ADD CONSTRAINT "map_version_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterEnum
-- This migration adds more than one value to the enum.
-- If we add only one value to an enum, do it as a single migration step.
-- If we add multiple values, we need to do it in multiple steps.
-- Step 1: Create a new enum with the new value
DO $$ BEGIN
 CREATE TYPE "ActionType_new" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'MOVE', 'LOCK', 'UNLOCK', 'VISUAL_STATE_CHANGE', 'PARENT_CHANGE', 'HANDLERS_CHANGE', 'LABEL_CHANGE', 'TYPE_CHANGE', 'AREA_CHANGE', 'RESTORE_VERSION');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Step 2: Alter the column to use the new enum
ALTER TABLE "node_history" ALTER COLUMN "action_type" TYPE "ActionType_new" USING ("action_type"::text::"ActionType_new");

-- Step 3: Drop the old enum
DROP TYPE "ActionType";

-- Step 4: Rename the new enum to the original name
ALTER TYPE "ActionType_new" RENAME TO "ActionType";

