const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@test.com',
            password: adminPassword,
            role: 'ADMIN',
            admin: {
                create: {
                    nama: 'Super Admin'
                }
            }
        }
    });
    console.log('✅ Admin created:', admin.email);

    // Create Perusahaan
    const perusahaanPassword = await bcrypt.hash('perusahaan123', 10);
    const perusahaan = await prisma.user.create({
        data: {
            email: 'pt.tech@test.com',
            password: perusahaanPassword,
            role: 'PERUSAHAAN',
            perusahaan: {
                create: {
                    namaPerusahaan: 'PT Tech Indonesia',
                    alamat: 'Jl. Sudirman No. 123, Jakarta',
                    telepon: '021-12345678',
                    email: 'info@pttech.com',
                    website: 'https://pttech.com',
                    deskripsi: 'Perusahaan teknologi terkemuka di Indonesia'
                }
            }
        }
    });
    console.log('✅ Perusahaan created:', perusahaan.email);

    // Create Mahasiswa
    const mahasiswaPassword = await bcrypt.hash('mahasiswa123', 10);
    const mahasiswa = await prisma.user.create({
        data: {
            email: 'john@student.com',
            password: mahasiswaPassword,
            role: 'MAHASISWA',
            mahasiswa: {
                create: {
                    nim: '12345678',
                    nama: 'John Doe',
                    jurusan: 'Teknik Informatika',
                    semester: 6
                }
            }
        }
    });
    console.log('✅ Mahasiswa created:', mahasiswa.email);

    // Create Lowongan
    const lowongan = await prisma.lowonganMagang.create({
        data: {
            judul: 'Software Engineer Intern',
            deskripsi: 'Mencari mahasiswa IT untuk magang sebagai software engineer. Akan terlibat dalam development web application menggunakan modern technology stack.',
            persyaratan: '- Mahasiswa aktif semester 5 ke atas\n- Menguasai JavaScript/TypeScript\n- Paham Git & GitHub\n- Komunikatif dan cepat belajar\n- Bisa bekerja dalam tim',
            lokasi: 'Jakarta (Hybrid)',
            durasi: '3 bulan',
            kuota: 5,
            status: 'BUKA',
            tanggalMulai: new Date('2024-03-01'),
            tanggalSelesai: new Date('2024-05-31'),
            perusahaanId: perusahaan.perusahaan.id
        }
    });
    console.log('✅ Lowongan created:', lowongan.judul);

    // Create another lowongan
    const lowongan2 = await prisma.lowonganMagang.create({
        data: {
            judul: 'UI/UX Designer Intern',
            deskripsi: 'Bergabunglah dengan tim design kami untuk membuat user experience yang luar biasa.',
            persyaratan: '- Mahasiswa Desain/DKV\n- Portfolio design\n- Menguasai Figma\n- Kreatif dan detail-oriented',
            lokasi: 'Jakarta',
            durasi: '4 bulan',
            kuota: 3,
            status: 'BUKA',
            tanggalMulai: new Date('2024-03-15'),
            tanggalSelesai: new Date('2024-07-15'),
            perusahaanId: perusahaan.perusahaan.id
        }
    });
    console.log('✅ Lowongan created:', lowongan2.judul);

    console.log('\n🎉 Seeding completed!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@test.com / admin123');
    console.log('Perusahaan: pt.tech@test.com / perusahaan123');
    console.log('Mahasiswa: john@student.com / mahasiswa123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });