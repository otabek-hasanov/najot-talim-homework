import { Module } from '@nestjs/common';
import { RegisterService } from './register.service.js';
import { RegisterController } from './register.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [RegisterService],
  controllers: [RegisterController]
})
export class RegisterModule {}
