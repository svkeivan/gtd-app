-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_itemId_fkey";

-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN     "category" TEXT,
ALTER COLUMN "itemId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "breakDuration" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "longBreakDuration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "lunchDuration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "lunchStartTime" TEXT NOT NULL DEFAULT '12:00',
ADD COLUMN     "pomodoroDuration" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "shortBreakInterval" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "workEndTime" TEXT NOT NULL DEFAULT '17:00',
ADD COLUMN     "workStartTime" TEXT NOT NULL DEFAULT '09:00';

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
