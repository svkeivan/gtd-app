/*
  Warnings:

  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('INBOX', 'NEXT_ACTION', 'PROJECT', 'WAITING_FOR', 'SOMEDAY_MAYBE', 'REFERENCE', 'COMPLETED', 'DELEGATED', 'TRASHED');

-- AlterTable
ALTER TABLE "Context" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'INBOX';
