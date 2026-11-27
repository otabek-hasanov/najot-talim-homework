import { Module } from '@nestjs/common';
import { LoginController } from './login.controller.js';
import { LoginService } from './login.service.js';
import { AuthModule } from '../auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [LoginController],
  providers: [LoginService]
})
export class LoginModule {}
