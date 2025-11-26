-- AlterTable
ALTER TABLE "NodeData" ADD COLUMN "locked" BOOLEAN DEFAULT false,
ADD COLUMN "visualState" JSONB;

