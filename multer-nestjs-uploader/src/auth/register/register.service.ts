import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto } from '../dto/register.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class RegisterService {
    constructor(private prisma: PrismaService){}
    async register(body: RegisterDto) {
        try {
            const existUser = await this.prisma.users.findUnique({
                where: {
                    email: body.email
                }
            })
            if(existUser) {
                throw new BadRequestException("Ushbu email bilan oldin ro'yxtadan o'tilgan")
            }
            const hashedPassword = await bcrypt.hash(body.password, 10)
            return await this.prisma.users.create({
                data: {
                    name: body.name,
                    email: body.email,
                    password: hashedPassword,
                    role: body.role
                }
            })

        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Serverda xatolik yuz berdi")
        }
    }
}
