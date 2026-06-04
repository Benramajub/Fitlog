import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  // Create admin
  const existing = await userRepo.findOne({ where: { email: 'admin@fitlog.com' } });
  if (!existing) {
    const admin = userRepo.create({
      email: 'admin@fitlog.com',
      passwordHash: await bcrypt.hash('admin1234', 10),
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
    console.log('✅ Admin created: admin@fitlog.com / admin1234');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  await AppDataSource.destroy();
  console.log('✅ Seed complete');
}

seed().catch((e) => { console.error(e); process.exit(1); });
