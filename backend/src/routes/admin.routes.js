// admin.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// ========================================
// PERUSAHAAN ROUTES
// ========================================

// Get all perusahaan
router.get('/perusahaan', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findMany({
            include: {
                user: {
                    select: { email: true }
                },
                _count: {
                    select: {
                        lowongan: true
                    }
                }
            }
        });

        // Tambahkan count lamaran untuk setiap perusahaan
        const perusahaanWithLamaran = await Promise.all(
            perusahaan.map(async (p) => {
                const lamaranCount = await prisma.lamaran.count({
                    where: {
                        lowongan: {
                            perusahaanId: p.id
                        }
                    }
                });

                return {
                    ...p,
                    email: p.user.email,
                    _count: {
                        ...p._count,
                        lamaran: lamaranCount
                    }
                };
            })
        );

        res.json(perusahaanWithLamaran);
    } catch (error) {
        console.error('Error get all perusahaan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single perusahaan by ID 
router.get('/perusahaan/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { id: req.params.id },
            include: {
                user: {
                    select: {
                        email: true,
                        createdAt: true
                    }
                },
                lowongan: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: {
                        _count: {
                            select: { lamaran: true }
                        }
                    }
                }
            }
        });

        if (!perusahaan) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        // Hitung statistik
        const totalLowongan = await prisma.lowonganMagang.count({
            where: { perusahaanId: req.params.id }
        });

        const lowonganAktif = await prisma.lowonganMagang.count({
            where: {
                perusahaanId: req.params.id,
                status: 'BUKA'
            }
        });

        // Hitung total lamaran dari semua lowongan perusahaan ini
        const totalLamaran = await prisma.lamaran.count({
            where: {
                lowongan: {
                    perusahaanId: req.params.id
                }
            }
        });

        const mahasiswaDiterima = await prisma.lamaran.count({
            where: {
                lowongan: {
                    perusahaanId: req.params.id
                },
                status: 'DITERIMA'
            }
        });

        // Merge data
        const response = {
            id: perusahaan.id,
            namaPerusahaan: perusahaan.namaPerusahaan,
            alamat: perusahaan.alamat,
            telepon: perusahaan.telepon,
            website: perusahaan.website,
            deskripsi: perusahaan.deskripsi,
            logo: perusahaan.logo,
            email: perusahaan.user.email,
            createdAt: perusahaan.user.createdAt,
            lowongan: perusahaan.lowongan,
            _count: {
                lowongan: totalLowongan,
                lamaran: totalLamaran
            },
            lowonganAktif,
            mahasiswaDiterima
        };

        res.json(response);
    } catch (error) {
        console.error('Error get perusahaan detail:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add perusahaan
router.post('/perusahaan', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const { email, password, namaPerusahaan, alamat, telepon, website } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'PERUSAHAAN',
                perusahaan: {
                    create: {
                        namaPerusahaan,
                        alamat,
                        telepon,
                        email,
                        website,
                        adminId: req.user.admin.id
                    }
                }
            },
            include: { perusahaan: true }
        });

        res.status(201).json(user.perusahaan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update perusahaan
router.put('/perusahaan/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const { email, password, namaPerusahaan, alamat, telepon, website, deskripsi } = req.body;

        const perusahaan = await prisma.perusahaan.findUnique({
            where: { id: req.params.id },
            include: { user: true }
        });

        if (!perusahaan) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== perusahaan.user.email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email sudah digunakan' });
            }
        }

        // Prepare user update data
        const userUpdateData = {};
        if (email) userUpdateData.email = email;
        if (password) userUpdateData.password = await bcrypt.hash(password, 10);

        // Update user and perusahaan in transaction
        const updated = await prisma.$transaction(async (tx) => {
            // Update user if there's data to update
            if (Object.keys(userUpdateData).length > 0) {
                await tx.user.update({
                    where: { id: perusahaan.userId },
                    data: userUpdateData
                });
            }

            // Update perusahaan
            const updatedPerusahaan = await tx.perusahaan.update({
                where: { id: req.params.id },
                data: {
                    namaPerusahaan,
                    alamat,
                    telepon,
                    email: email || perusahaan.email,
                    website,
                    deskripsi
                },
                include: {
                    user: {
                        select: { email: true }
                    }
                }
            });

            return updatedPerusahaan;
        });

        res.json(updated);
    } catch (error) {
        console.error('Error update perusahaan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete perusahaan
router.delete('/perusahaan/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { id: req.params.id },
            include: { user: true }
        });

        if (!perusahaan) {
            return res.status(404).json({ message: 'Perusahaan not found' });
        }

        await prisma.user.delete({ where: { id: perusahaan.userId } });

        res.json({ message: 'Perusahaan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ========================================
// MAHASISWA ROUTES
// ========================================

// Get all mahasiswa
router.get('/mahasiswa', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const mahasiswa = await prisma.mahasiswa.findMany({
            include: {
                user: {
                    select: { email: true }
                },
                _count: {
                    select: { lamaran: true }
                }
            }
        });
        res.json(mahasiswa);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// get detail mahasiswa
router.get('/mahasiswa/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;

        const mahasiswa = await prisma.mahasiswa.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                },
                lamaran: {
                    include: {
                        lowongan: {
                            include: {
                                perusahaan: true
                            }
                        }
                    },
                    orderBy: {
                        tanggalLamar: 'desc'
                    }
                },
                _count: {
                    select: { lamaran: true }
                }
            }
        });

        if (!mahasiswa) {
            return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
        }

        res.json(mahasiswa);
    } catch (error) {
        console.error('Error get mahasiswa detail:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})
// ========================================
// LAMARAN ROUTES
// ========================================

// Get all lamaran
router.get('/lamaran', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const lamaran = await prisma.lamaran.findMany({
            include: {
                mahasiswa: {
                    select: {
                        nama: true,
                        nim: true,
                        jurusan: true
                    }
                },
                lowongan: {
                    include: {
                        perusahaan: {
                            select: { namaPerusahaan: true }
                        }
                    }
                }
            },
            orderBy: { tanggalLamar: 'desc' }
        });
        res.json(lamaran);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ========================================
// HISTORY MAGANG ROUTES
// ========================================

// Get all history magang
router.get('/history', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const history = await prisma.historyMagang.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/history/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const history = await prisma.historyMagang.findUnique({
            where: { id: req.params.id }
        });

        if (!history) {
            return res.status(404).json({ message: 'History tidak ditemukan' });
        }

        res.json(history);
    } catch (error) {
        console.error('Error get history detail:', error);
        res.status(500).json({ message: 'Server error', error: error.message })
    }
});

// Add history magang
router.post('/history', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const { namaMahasiswa, nimMahasiswa, jurusanMahasiswa, namaPerusahaan, posisiMagang, websitePerusahaan, tanggalMulai, tanggalSelesai, sistemKerja, catatan } = req.body;

        const history = await prisma.historyMagang.create({
            data: {
                namaMahasiswa,
                nimMahasiswa,
                jurusanMahasiswa,
                posisiMagang,
                namaPerusahaan,
                websitePerusahaan,
                tanggalMulai: new Date(tanggalMulai),
                tanggalSelesai: new Date(tanggalSelesai),
                sistemKerja,
                catatan,
                adminId: req.user.admin.id
            }
        });

        res.status(201).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update history magang
router.put('/history/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const {
            namaMahasiswa,
            nimMahasiswa,
            jurusanMahasiswa,
            namaPerusahaan,
            posisiMagang,
            websitePerusahaan,
            tanggalMulai,
            tanggalSelesai,
            sistemKerja,
            catatan
        } = req.body;

        const updateData = {
            namaMahasiswa,
            nimMahasiswa,
            jurusanMahasiswa,
            namaPerusahaan,
            posisiMagang,
            websitePerusahaan
        };

        if (tanggalMulai) {
            updateData.tanggalMulai = new Date(tanggalMulai);
        }

        if (tanggalSelesai) {
            updateData.tanggalSelesai = new Date(tanggalSelesai);
        }

        if (sistemKerja !== undefined) {
            updateData.sistemKerja = sistemKerja;
        }

        if (catatan !== undefined) {
            updateData.catatan = catatan;
        }

        const history = await prisma.historyMagang.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete history
router.delete('/history/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        await prisma.historyMagang.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'History deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;