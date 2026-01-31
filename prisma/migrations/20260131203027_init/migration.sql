-- CreateEnum
CREATE TYPE "Source" AS ENUM ('LINKEDIN', 'INTRO', 'INBOUND', 'OTHER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NEW', 'CONTACTED', 'CALL_DONE', 'DEAL', 'LOST');

-- CreateTable
CREATE TABLE "business_leads" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" "Source" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_leads_email_key" ON "business_leads"("email");

-- CreateIndex
CREATE INDEX "business_leads_status_idx" ON "business_leads"("status");
