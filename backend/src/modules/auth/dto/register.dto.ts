import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Nama Perusahaan / UMKM', example: 'IG.STORE Laundry' })
  @IsString()
  @IsNotEmpty({ message: 'Nama perusahaan wajib diisi' })
  company_name: string;

  @ApiProperty({ description: 'Nama Lengkap Owner', example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  name: string;

  @ApiProperty({ description: 'Alamat Email Owner', example: 'owner@igstore.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @ApiProperty({ description: 'Kata Sandi Akun Owner', example: 'PasswordSecure123!' })
  @IsString()
  @MinLength(8, { message: 'Password minimal terdiri dari 8 karakter' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password: string;
}
