import { Body, Controller, Post } from '@nestjs/common';
import { LoginService } from './login.service.js';
import { LoginDto } from '../dto/login.dto.js';

@Controller('auth/login')
export class LoginController {
    constructor(private readonly LoginSercie: LoginService) {}
    @Post()
    register(@Body() body: LoginDto) {
        return this.LoginSercie.login(body)
    }
}
