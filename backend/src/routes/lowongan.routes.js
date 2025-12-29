// lowongan.routes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// get all lowongan
router.get('/', async (req, res) => {
    try {
        const { status, perusahaan } = req.query;

        const where = {};
        if (status) where.status = status;
        if (perusahaan) where.perusahaanId = perusahaan;

        const lowongan = await prisma.lowonganMagang.findMany({
            where,
            include: {
                perusahaan: {
                    select: {
                        namaPerusahaan: true,
                        logo: true,
                        alamat: true
                    }
                },
                _count: {
                    select: { lamaran: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(lowongan);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// get lowongan by ID
router.get('/:id', async (req, res) => {
    try {
        const lowongan = await prisma.lowonganMagang.findUnique({
            where: { id: req.params.id },
            include: {
                perusahaan: true,
                _count: {
                    select: { lamaran: true }
                }
            }
        });

        if (!lowongan) {
            return res.status(404).json({ message: 'Lowongan not found' });
        }

        res.json(lowongan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// create lowongan (perusahaan)
router.post('/', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = req.user.perusahaan;

        const lowongan = await prisma.lowonganMagang.create({
            data: {
                ...req.body,
                perusahaanId: perusahaan.id,
                tanggalMulai: new Date(req.body.tanggalMulai),
                tanggalSelesai: new Date(req.body.tanggalSelesai)
            },
            include: { perusahaan: true }
        });
        res.status(201).json(lowongan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// update lowongan
router.put('/:id', authenticate, authorize('PERUSAHAAN', 'ADMIN'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.body.tanggalMulai) {
            updateData.tanggalMulai = new Date(req.body.tanggalMulai);
        }
        if (req.body.tanggalSelesai) {
            updateData.tanggalSelesai = new Date(req.body.tanggalSelesai);
        }

        const lowongan = await prisma.lowonganMagang.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(lowongan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// delete lowongan
router.delete('/:id', authenticate, authorize('PERUSAHAAN', 'ADMIN'), async (req, res) => {
    try {
        await prisma.lowonganMagang.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Lowongan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 