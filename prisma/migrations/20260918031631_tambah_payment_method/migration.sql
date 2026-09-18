-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFER_BANK', 'QRIS', 'E_WALLET');

-- AlterTable
ALTER TABLE "BillParticipant" ADD COLUMN     "paymentMethod" "PaymentMethod";
