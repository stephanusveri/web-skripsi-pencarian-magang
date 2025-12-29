// auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Register

router.post('/register', async (req, res) => {
    try {
        const { email, password, role, ...profileData } = req.body;

        // validasi
        if (!email || !password || !role) {
            return res.status(400).json({
                message: 'Email, password, and role are required'
            });
        }

        // check existing user
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user dengan profile sesuai role
        const userData = {
            email,
            password: hashedPassword,
            role
        };

        if (role === 'ADMIN') {
            userData.admin = {
                create: { nama: profileData.nama }
            };
        } else if (role === 'MAHASISWA') {
            userData.mahasiswa = {
                create: {
                    nim: profileData.nim,
                    nama: profileData.nama,
                    jurusan: profileData.jurusan,
                    semester: parseInt(profileData.semester)
                }
            };
        } else if (role == 'PERUSAHAAN') {
            userData.perusahaan = {
                create: {
                    namaPerusahaan: profileData.namaPerusahaan,
                    alamat: profileData.alamat,
                    telepon: profileData.telepon,
                    email: profileData.email || email,
                    website: profileData.website || null
                }
            };
        }

        const user = await prisma.user.create({
            data: userData,
            include: { admin: true, mahasiswa: true, perusahaan: true }
        });

        // generate token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // remove password from response
        delete user.password;

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // validasi
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email dan Password are required'
            });
        }

        // find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { admin: true, mahasiswa: true, perusahaan: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: ' Invalid credentials ' });
        }

        // generate token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // remove password from response
        delete user.password;
        res.json({ user, token });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;