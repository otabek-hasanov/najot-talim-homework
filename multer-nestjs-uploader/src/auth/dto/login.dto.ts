import {IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
    @IsEmail({},{
        message: "Email bo'lishi kerak"
    })
    email: string

    @IsNotEmpty()
        password: string;
}