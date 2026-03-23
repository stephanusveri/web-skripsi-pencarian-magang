/*
  Warnings:

  - You are about to drop the column `sertifikat` on the `HistoryMagang` table. All the data in the column will be lost.
  - You are about to drop the column `catatan` on the `Lamaran` table. All the data in the column will be lost.
  - You are about to drop the column `suratLamaran` on the `Lamaran` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HistoryMagang" DROP COLUMN "sertifikat";

-- AlterTable
ALTER TABLE "Lamaran" DROP COLUMN "catatan",
DROP COLUMN "suratLamaran",
ADD COLUMN     "cvFileName" TEXT,
ADD COLUMN     "cvLink" TEXT,
ADD COLUMN     "linkedinLink" TEXT,
ADD COLUMN     "portfolioLink" TEXT,
ADD COLUMN     "resumeLink" TEXT;
