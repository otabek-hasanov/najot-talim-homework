import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, Length, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(2, 100)
  title: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
