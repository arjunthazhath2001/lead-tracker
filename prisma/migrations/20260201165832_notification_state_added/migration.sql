-- CreateEnum
CREATE TYPE "NotificationState" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "business_leads" ADD COLUMN     "notificationState" "NotificationState" NOT NULL DEFAULT 'PENDING';
