-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MAHASISWA', 'PERUSAHAAN');

-- CreateEnum
CREATE TYPE "StatusLowongan" AS ENUM ('BUKA', 'TUTUP');

-- CreateEnum
CREATE TYPE "StatusLamaran" AS ENUM ('PENDING', 'DITERIMA', 'DITOLAK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mahasiswa" (
    "id" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jurusan" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "foto" TEXT,
    "cv" TEXT,
    "transkrip" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perusahaan" (
    "id" TEXT NOT NULL,
    "namaPerusahaan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "deskripsi" TEXT,
    "logo" TEXT,
    "userId" TEXT NOT NULL,
    "adminId" TEXT,

    CONSTRAINT "Perusahaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LowonganMagang" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "persyaratan" TEXT NOT NULL,
    "kuota" INTEGER NOT NULL,
    "durasi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "status" "StatusLowongan" NOT NULL DEFAULT 'BUKA',
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "perusahaanId" TEXT NOT NULL,

    CONSTRAINT "LowonganMagang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lamaran" (
    "id" TEXT NOT NULL,
    "status" "StatusLamaran" NOT NULL DEFAULT 'PENDING',
    "suratLamaran" TEXT NOT NULL,
    "tanggalLamar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catatan" TEXT,
    "mahasiswaId" TEXT NOT NULL,
    "lowonganId" TEXT NOT NULL,

    CONSTRAINT "Lamaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryMagang" (
    "id" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3) NOT NULL,
    "nilaiAkhir" DOUBLE PRECISION,
    "sertifikat" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lamaranId" TEXT NOT NULL,
    "lowonganId" TEXT NOT NULL,
    "adminId" TEXT,

    CONSTRAINT "HistoryMagang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mahasiswa_nim_key" ON "Mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "Mahasiswa_userId_key" ON "Mahasiswa"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Perusahaan_userId_key" ON "Perusahaan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Lamaran_mahasiswaId_lowonganId_key" ON "Lamaran"("mahasiswaId", "lowonganId");

-- CreateIndex
CREATE UNIQUE INDEX "HistoryMagang_lamaranId_key" ON "HistoryMagang"("lamaranId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mahasiswa" ADD CONSTRAINT "Mahasiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perusahaan" ADD CONSTRAINT "Perusahaan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perusahaan" ADD CONSTRAINT "Perusahaan_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LowonganMagang" ADD CONSTRAINT "LowonganMagang_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lamaran" ADD CONSTRAINT "Lamaran_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lamaran" ADD CONSTRAINT "Lamaran_lowonganId_fkey" FOREIGN KEY ("lowonganId") REFERENCES "LowonganMagang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryMagang" ADD CONSTRAINT "HistoryMagang_lamaranId_fkey" FOREIGN KEY ("lamaranId") REFERENCES "Lamaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryMagang" ADD CONSTRAINT "HistoryMagang_lowonganId_fkey" FOREIGN KEY ("lowonganId") REFERENCES "LowonganMagang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryMagang" ADD CONSTRAINT "HistoryMagang_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
