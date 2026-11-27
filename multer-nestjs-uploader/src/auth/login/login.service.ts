import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LoginDto } from '../dto/login.dto.js';
import bcrypt from 'bcrypt'
import { AuthService } from '../auth.service.js';

@Injectable()
export class LoginService {
    constructor(private prisma: PrismaService, private AuthService: AuthService){}
    async login(body: LoginDto) {
        try {
            const user = await this.prisma.users.findUnique({
            where:{
                email: body.email
            }
        })
        if(!user) {
            throw new BadRequestException("Ushbu email bilan foydalanuvchi topilmadi")
        }
        const isPasswordCorrect = await bcrypt.compare(body.password, user.password)
        if(!isPasswordCorrect) {
            throw new BadRequestException("Parollar mos kelmaydi")
        }
        const token = this.AuthService.generateToken({
            id: user.id,
            email:user.email,
            role: user.role
        })
        const {password, ...withoutPassword} = user;

        return {
            message: "Login muvaffaqiyatli",
            access_token: token,
            data: withoutPassword
        }

        } catch (error) {
            if(error instanceof HttpException){
                throw error
            }
            throw new InternalServerErrorException("Serverda xatolik yuz berdi")
        }
    }
}
