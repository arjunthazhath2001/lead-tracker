/*
  Warnings:

  - You are about to drop the column `notificationState` on the `business_leads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "business_leads" DROP COLUMN "notificationState",
ADD COLUMN     "dealClosedNotification" "NotificationState" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "newLeadNotification" "NotificationState" NOT NULL DEFAULT 'PENDING';
