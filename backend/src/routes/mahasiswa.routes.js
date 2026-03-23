// mahasiswa.routes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '../../uploads/cv');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: async (req, file, cb) => {
        try {
            const prisma = new PrismaClient();

            const mahasiswa = await prisma.mahasiswa.findUnique({
                where: { userId: req.user.id }
            });

            if (!mahasiswa) {
                return cb(new Error('Mahasiswa tidak ditemukan'));
            }

            const safeName = mahasiswa.nama.toLowerCase().replace(/[^a-z0-9]/g, '-');

            const ext = path.extname(file.originalname);
            const filename = `cv-${safeName}.pdf`;

            cb(null, filename);
        } catch (error) {
            cb(error);
        }
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Hanya file PDF yang diperbolehkan!'));
        }
    }
});

// get my applications
router.get('/lamaran', authenticate, authorize('MAHASISWA'), async (req, res) => {
    try {
        const mahasiswa = req.user.mahasiswa;

        const lamaran = await prisma.lamaran.findMany({
            where: { mahasiswaId: mahasiswa.id },
            include: {
                lowongan: {
                    include: { perusahaan: true }
                }
            },
            orderBy: { tanggalLamar: 'desc' }
        });

        res.json(lamaran);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// apply to lowongan (submit lamaran)
router.post('/lamaran', authenticate, authorize('MAHASISWA'), upload.single('cv'), async (req, res) => {
    try {
        const { lowonganId, cvLink, portfolioLink, linkedinLink, resumeLink } = req.body;
        const mahasiswa = await prisma.mahasiswa.findUnique({
            where: { userId: req.user.id }
        });

        if (!mahasiswa) {
            return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
        }

        // validasi harus mengisi salah satu form cv
        if (!req.file && !cvLink) {
            return res.status(400).json({
                message: 'CV file / CV link harus diisi'
            });
        }

        // check if already applied
        const existingLamaran = await prisma.lamaran.findUnique({
            where: {
                mahasiswaId_lowonganId: {
                    mahasiswaId: mahasiswa.id,
                    lowonganId
                }
            }
        });

        if (existingLamaran) {
            return res.status(400).json({ message: 'Anda sudah melamar di lowongan ini' });
        }

        const lamaran = await prisma.lamaran.create({
            data: {
                mahasiswaId: mahasiswa.id,
                lowonganId,
                cvLink: cvLink || null,
                cvFileName: req.file ? req.file.filename : null,
                portfolioLink: portfolioLink || null,
                linkedinLink: linkedinLink || null,
                resumeLink: resumeLink || null
            },
            include: {
                lowongan: {
                    include: { perusahaan: true }
                }
            }
        });
        res.status(201).json(lamaran);
    } catch (error) {
        console.error('Error saat submit lamaran:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// get all history
router.get('/history', authenticate, authorize('MAHASISWA'), async (req, res) => {
    try {
        const history = await prisma.historyMagang.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        console.error('Error get history for mahasiswa:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// update profile
router.put('/profile', authenticate, authorize('MAHASISWA'), async (req, res) => {
    try {
        const mahasiswa = await prisma.mahasiswa.update({
            where: { id: req.user.mahasiswa.id },
            data: req.body
        });

        res.json(mahasiswa);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;