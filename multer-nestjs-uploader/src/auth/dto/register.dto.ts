import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MinLength } from "class-validator";
import { Role } from "@prisma/client";

export class RegisterDto {
    @IsString({
        message: "ism text bo'lishi kerak"
    })
    @Length(3, 20, {
        message: "ism minimal 3 va maksimal 20 ta belgidan tashkil topgan bo'lishi kerak"
    })
    name: string;
    @IsEmail({}, {
        message: "To'g'ri email yozing"
    })
    email: string;

    @IsNotEmpty()
    @MinLength(6, {
        message: "Parol 6 ta belgidan iborat bo'lishi kerak"
    })
    password: string;

    @IsOptional()
    @IsEnum(Role, {
        message: "role ADMIN, SELLER yoki USER bo'lishi kerak"
    })
    role?: Role;
}