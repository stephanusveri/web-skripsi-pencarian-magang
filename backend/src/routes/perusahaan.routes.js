// perusahaan.routes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// get profile perusahaan
router.get('/profile', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id },
            include: {
                user: {
                    select: { email: true }
                },
                _count: {
                    select: { lowongan: true }
                }
            }
        });

        if (!perusahaan) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        res.json({
            ...perusahaan,
            email: perusahaan.user.email
        });
    } catch (error) {
        console.error('Error get profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// update profile perusahaan
router.put('/profile', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const {
            namaPerusahaan,
            alamat,
            telepon,
            email,
            website,
            deskripsi,
            logo
        } = req.body;

        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id },
            include: { user: true }
        });


        if (!perusahaan) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        if (email && email !== perusahaan.user.email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email sudah digunakan' });
            }
        }

        const updated = await prisma.$transaction(async (tx) => {
            if (email && email !== perusahaan.user.email) {
                await tx.user.update({
                    where: { id: req.user.id },
                    data: { email }
                });
            }

            const updatedPerusahaan = await tx.perusahaan.update({
                where: { id: perusahaan.id },
                data: {
                    namaPerusahaan,
                    alamat,
                    telepon,
                    email: email || perusahaan.email,
                    website,
                    deskripsi,
                    logo
                },
                include: {
                    user: {
                        select: { email: true }
                    }
                }
            });

            return updatedPerusahaan;
        });

        res.json({
            ...updated,
            email: updated.user.email
        });
    } catch (error) {
        console.error('Error update profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// get all lowongan
router.get('/lowongan', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id }
        });

        if (!perusahaan) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        const lowongan = await prisma.lowonganMagang.findMany({
            where: { perusahaanId: perusahaan.id },
            include: {
                _count: {
                    select: { lamaran: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(lowongan);
    } catch (error) {
        console.error('Error get lowongan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/lowongan/:id', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id }
        });

        const lowongan = await prisma.lowonganMagang.findFirst({
            where: {
                id: req.params.id,
                perusahaanId: perusahaan.id
            },
            include: {
                _count: {
                    select: { lamaran: true }
                }
            }
        });

        if (!lowongan) {
            return res.status(404).json({ message: 'Lowongan tidak ditemukan' });
        }

        res.json(lowongan);
    } catch (error) {
        console.error('Error get lowongan detail:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// create lowongan
router.post('/lowongan', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id }
        });

        if (!perusahaan) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        const {
            judul,
            deskripsi,
            persyaratan,
            kuota,
            durasi,
            lokasi,
            tanggalMulai,
            tanggalSelesai
        } = req.body;

        const lowongan = await prisma.lowonganMagang.create({
            data: {
                judul,
                deskripsi,
                persyaratan,
                kuota: parseInt(kuota),
                durasi,
                lokasi,
                tanggalMulai: new Date(tanggalMulai),
                tanggalSelesai: new Date(tanggalSelesai),
                perusahaanId: perusahaan.id
            }
        });

        res.status(201).json(lowongan);
    } catch (error) {
        console.error('Error create lowongan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// update lowongan
router.put('/lowongan/:id', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id }
        });

        // Verify ownership
        const existingLowongan = await prisma.lowonganMagang.findFirst({
            where: {
                id: req.params.id,
                perusahaanId: perusahaan.id
            }
        });

        if (!existingLowongan) {
            return res.status(404).json({ message: 'Lowongan tidak ditemukan' });
        }

        const {
            judul,
            deskripsi,
            persyaratan,
            kuota,
            durasi,
            lokasi,
            status,
            tanggalMulai,
            tanggalSelesai
        } = req.body;

        const updateData = {
            judul,
            deskripsi,
            persyaratan,
            durasi,
            lokasi,
            status
        };

        if (kuota) updateData.kuota = parseInt(kuota);
        if (tanggalMulai) updateData.tanggalMulai = new Date(tanggalMulai);
        if (tanggalSelesai) updateData.tanggalSelesai = new Date(tanggalSelesai);

        const lowongan = await prisma.lowonganMagang.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json(lowongan);
    } catch (error) {
        console.error('Error update lowongan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// delete lowongan
router.delete('/lowongan/:id', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id }
        });

        const existingLowongan = await prisma.lowonganMagang.findFirst({
            where: {
                id: req.params.id,
                perusahaanId: perusahaan.id
            }
        });

        if (!existingLowongan) {
            return res.status(404).json({ message: 'Lowongan tidak ditemukan' });
        }

        await prisma.lowonganMagang.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Lowongan berhasil dihapus' });
    } catch (error) {
        console.error('Error delete lowongan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Lamaran

// get all lamaran
router.get('/lamaran', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id }
        });

        if (!perusahaan) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        const lamaran = await prisma.lamaran.findMany({
            where: {
                lowongan: {
                    perusahaanId: perusahaan.id
                }
            },
            include: {
                mahasiswa: {
                    select: {
                        id: true,
                        nama: true,
                        nim: true,
                        jurusan: true,
                        semester: true,
                        cv: true,
                        transkrip: true
                    }
                },
                lowongan: {
                    select: {
                        id: true,
                        judul: true,
                        durasi: true,
                        lokasi: true
                    }
                }
            },
            orderBy: { tanggalLamar: 'desc' }
        });

        res.json(lamaran);
    } catch (error) {
        console.error('Error get lamaran:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// get lamaran by id
router.get('/lamaran/:id', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id }
        });

        const lamaran = await prisma.lamaran.findFirst({
            where: {
                id: req.params.id,
                lowongan: {
                    perusahaanId: perusahaan.id
                }
            },
            include: {
                mahasiswa: true,
                lowongan: true
            }
        });

        if (!lamaran) {
            return res.status(404).json({ message: 'Lamaran tidak ditemukan' })
        }

        res.json(lamaran);
    } catch (error) {
        console.error('Error get lamaran detail:', error);
        res.status(500).json({ message: 'Server error', error: error.message })
    }
});

// update status lamaran
router.patch('/lamaran/:id/status', authenticate, authorize('PERUSAHAAN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { userId: req.user.id }
        });

        const lamaran = await prisma.lamaran.findFirst({
            where: {
                id: req.params.id,
                lowongan: {
                    perusahaanId: perusahaan.id
                }
            }
        });

        if (!lamaran) {
            return res.status(404).json({ message: 'Lamaran tidak ditemukan' });
        }

        const { status, catatan } = req.body;

        if (!['DITERIMA', 'DITOLAK'].includes(status)) {
            return res.status(400).json({ message: 'Status tidak valid' });
        }

        const updated = await prisma.lamaran.update({
            where: { id: req.params.id },
            data: {
                status,
                catatan
            },
            include: {
                mahasiswa: {
                    select: {
                        nama: true,
                        nim: true
                    }
                },
                lowongan: {
                    select: {
                        judul: true
                    }
                }
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error update status lamaran:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})


module.exports = router;