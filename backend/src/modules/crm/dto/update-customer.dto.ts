import { IsEmail, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { CustomerStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: 'Nama Pelanggan', example: 'Budi Santoso' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Nomor Telepon (WhatsApp)', example: '081234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Alamat Email', example: 'budi@mail.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Alamat Rumah / Kantor', example: 'Jl. Sudirman No. 12, Jakarta' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Status Pelanggan', enum: CustomerStatus, example: CustomerStatus.LEAD })
  @IsEnum(CustomerStatus, { message: 'Status pelanggan tidak valid' })
  @IsOptional()
  status?: CustomerStatus;

  @ApiPropertyOptional({ description: 'Tag / Label Pelanggan', type: [String], example: ['VIP', 'Promo'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
