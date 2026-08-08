-- CreateEnum
CREATE TYPE "MeetingDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "Cell" ADD COLUMN     "meetingDay" "MeetingDay",
ADD COLUMN     "meetingTime" TEXT;
