/*
  Warnings:

  - You are about to drop the column `nilaiAkhir` on the `HistoryMagang` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HistoryMagang" DROP COLUMN "nilaiAkhir",
ADD COLUMN     "sistemKerja" TEXT;
