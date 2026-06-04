import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import dayjs from 'dayjs'
import { Member, PackageType, PACKAGE_SESSIONS, Gender } from '../database/entities/member.entity';
import { User, UserRole } from '../database/entities/user.entity';

export class CreateMemberDto {
  name: string;
  email: string;
  password?: string;
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  joinedAt: string;
  packageType: PackageType;
  goal?: string;
  notes?: string;
}

export class UpdateMemberDto {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  notes?: string;
  packageType?: PackageType;
}

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findAll() {
    return this.memberRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async findOne(id: string) {
    const member = await this.memberRepo.findOne({
      where: { id },
      relations: ['user', 'sessions', 'nutritionPlans'],
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async create(dto: CreateMemberDto) {
    // Validate required fields
    if (!dto.email) throw new BadRequestException('Email is required');
    if (!dto.name) throw new BadRequestException('Name is required');
    if (!dto.packageType) throw new BadRequestException('Package type is required');
    if (!dto.joinedAt) throw new BadRequestException('Join date is required');

    // Check duplicate email
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException(`Email "${dto.email}" is already in use`);

    // Calculate expiry
    const joinedAt = dayjs(dto.joinedAt);
    const monthsMap: Record<PackageType, number> = {
      [PackageType.ONE_MONTH]: 1,
      [PackageType.TWO_MONTHS]: 2,
      [PackageType.FOUR_MONTHS]: 4,
    };
    const expiresAt = joinedAt.add(monthsMap[dto.packageType], 'month').toDate();
    const totalSessions = PACKAGE_SESSIONS[dto.packageType];

    // Create user account
    const user = this.userRepo.create({
      email: dto.email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password || 'member1234', 10),
      role: UserRole.MEMBER,
    });
    await this.userRepo.save(user);

    // Create member profile
    const member = this.memberRepo.create({
      user,
      name: dto.name,
      age: dto.age,
      weight: dto.weight,
      height: dto.height,
      gender: dto.gender,
      joinedAt: joinedAt.toDate(),
      expiresAt,
      packageType: dto.packageType,
      totalSessions,
      usedSessions: 0,
      goal: dto.goal,
      notes: dto.notes,
    });

    return this.memberRepo.save(member);
  }

  async update(id: string, dto: UpdateMemberDto) {
    const member = await this.findOne(id);
    Object.assign(member, dto);
    if (dto.packageType) {
      member.totalSessions = PACKAGE_SESSIONS[dto.packageType];
    }
    return this.memberRepo.save(member);
  }

  async remove(id: string) {
    const member = await this.findOne(id);
    await this.memberRepo.softRemove(member);
    return { success: true };
  }

  async getStats(id: string) {
    const member = await this.findOne(id);
    return {
      remainingSessions: member.totalSessions - member.usedSessions,
      usedSessions: member.usedSessions,
      totalSessions: member.totalSessions,
      expiresAt: member.expiresAt,
      isExpired: dayjs().isAfter(dayjs(member.expiresAt)),
      daysLeft: dayjs(member.expiresAt).diff(dayjs(), 'day'),
    };
  }
}