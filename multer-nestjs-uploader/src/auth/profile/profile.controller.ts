import { Controller, Get, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

@Controller('profile')
export class ProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async profile(@Req() req: any) {
    const user = await this.prisma.users.findUnique({
      where: { id: req.user.id },
      include: { products: { orderBy: { id: 'asc' } } },
    });
    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }
    const { password, ...withoutPassword } = user;
    return withoutPassword;
  }
}
