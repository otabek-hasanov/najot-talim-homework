import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto.js';
import { RegisterService } from './register.service.js';

@Controller('auth/register')
export class RegisterController {
    constructor(private readonly RegisterService: RegisterService) {}

    @Post()
    register(@Body() body: RegisterDto) {
        return this.RegisterService.register(body)
    }
}
