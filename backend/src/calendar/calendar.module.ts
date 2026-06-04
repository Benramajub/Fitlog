// calendar.module.ts
import { Module } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [SessionsModule],
  controllers: [CalendarController],
})
export class CalendarModule {}

// calendar.controller.ts (same file for brevity)
