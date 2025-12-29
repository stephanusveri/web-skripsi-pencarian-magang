// mahasiswa.routes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

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

// apply to lowongan
router.post('/lamaran', authenticate, authorize('MAHASISWA'), async (req, res) => {
    try {
        const { lowonganId, suratLamaran, catatan } = req.body;
        const mahasiswa = req.user.mahasiswa;

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
            return res.status(400).json({ message: 'Already applied to this position' });
        }

        const lamaran = await prisma.lamaran.create({
            data: {
                mahasiswaId: mahasiswa.id,
                lowonganId,
                suratLamaran,
                catatan
            },
            include: {
                lowongan: {
                    include: { perusahaan: true }
                }
            }
        });
        res.status(201).json(lamaran);
    } catch (error) {
        console.error('Error:', error);
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