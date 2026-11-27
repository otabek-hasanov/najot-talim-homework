import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RoleGuard } from './guards/role.guard.js';
import { ProfileController } from './profile/profile.controller.js';
@Module({
    imports: [JwtModule.register({
        secret: process.env.AUTH_JWT,
        signOptions: {
            expiresIn: "1h"
        }
    })],
    controllers: [ProfileController],
    providers: [AuthService, JwtAuthGuard, RoleGuard],
    exports: [JwtModule, AuthService, JwtAuthGuard, RoleGuard]
})
export class AuthModule { }
