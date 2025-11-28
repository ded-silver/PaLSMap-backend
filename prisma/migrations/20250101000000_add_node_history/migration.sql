-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('NODE', 'EDGE', 'TABLE_DATA');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'MOVE', 'LOCK', 'UNLOCK', 'VISUAL_STATE_CHANGE', 'PARENT_CHANGE', 'HANDLERS_CHANGE', 'LABEL_CHANGE', 'TYPE_CHANGE');

-- CreateTable
CREATE TABLE "node_history" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "changes" JSONB NOT NULL,
    "description" TEXT,

    CONSTRAINT "node_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "node_history_entity_type_entity_id_idx" ON "node_history"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "node_history_user_id_idx" ON "node_history"("user_id");

-- CreateIndex
CREATE INDEX "node_history_created_at_idx" ON "node_history"("created_at");

-- AddForeignKey
ALTER TABLE "node_history" ADD CONSTRAINT "node_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

