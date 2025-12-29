/*
  Warnings:

  - You are about to drop the column `lamaranId` on the `HistoryMagang` table. All the data in the column will be lost.
  - You are about to drop the column `lowonganId` on the `HistoryMagang` table. All the data in the column will be lost.
  - Added the required column `jurusanMahasiswa` to the `HistoryMagang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaMahasiswa` to the `HistoryMagang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaPerusahaan` to the `HistoryMagang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nimMahasiswa` to the `HistoryMagang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posisiMagang` to the `HistoryMagang` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HistoryMagang" DROP CONSTRAINT "HistoryMagang_lamaranId_fkey";

-- DropForeignKey
ALTER TABLE "HistoryMagang" DROP CONSTRAINT "HistoryMagang_lowonganId_fkey";

-- DropIndex
DROP INDEX "HistoryMagang_lamaranId_key";

-- AlterTable
ALTER TABLE "HistoryMagang" DROP COLUMN "lamaranId",
DROP COLUMN "lowonganId",
ADD COLUMN     "jurusanMahasiswa" TEXT NOT NULL,
ADD COLUMN     "namaMahasiswa" TEXT NOT NULL,
ADD COLUMN     "namaPerusahaan" TEXT NOT NULL,
ADD COLUMN     "nimMahasiswa" TEXT NOT NULL,
ADD COLUMN     "posisiMagang" TEXT NOT NULL,
ADD COLUMN     "websitePerusahaan" TEXT;
