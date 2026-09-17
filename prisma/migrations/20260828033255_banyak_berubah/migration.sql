/*
  Warnings:

  - You are about to drop the column `userId` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `BillParticipant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shareToken]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[billId,contactId]` on the table `BillParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billId` to the `BillParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactId` to the `BillParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_userId_fkey";

-- DropForeignKey
ALTER TABLE "BillItem" DROP CONSTRAINT "BillItem_billId_fkey";

-- DropForeignKey
ALTER TABLE "BillItem" DROP CONSTRAINT "BillItem_participantId_fkey";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "userId",
ADD COLUMN     "grossAmount" INTEGER,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "shareToken" TEXT;

-- AlterTable
ALTER TABLE "BillParticipant" DROP COLUMN "name",
ADD COLUMN     "billId" TEXT NOT NULL,
ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "contactId" TEXT NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_ownerId_name_key" ON "Contact"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_shareToken_key" ON "Bill"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "BillParticipant_billId_contactId_key" ON "BillParticipant"("billId", "contactId");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "BillParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillParticipant" ADD CONSTRAINT "BillParticipant_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillParticipant" ADD CONSTRAINT "BillParticipant_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
