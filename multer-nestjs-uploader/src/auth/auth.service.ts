import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private JwtService: JwtService) { }
    
    generateToken(user: { id: number, email: string, role: Role }) {
        const token = this.JwtService.sign({
            id: user.id,
            email: user.email,
            role: user.role
        })
        return token
    }
}
