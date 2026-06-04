import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { SessionsModule } from './sessions/sessions.module';
import { ProgramsModule } from './programs/programs.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { CalendarModule } from './calendar/calendar.module';
import { WorkoutLogsModule } from './workout-logs/workout-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'fitlog'),
        password: cfg.get('DB_PASS', 'fitlog_secret'),
        database: cfg.get('DB_NAME', 'fitlog_pro'),
        autoLoadEntities: true,
        synchronize: cfg.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    MembersModule,
    SessionsModule,
    ProgramsModule,
    NutritionModule,
    CalendarModule,
    WorkoutLogsModule,
  ],
})
export class AppModule {}
