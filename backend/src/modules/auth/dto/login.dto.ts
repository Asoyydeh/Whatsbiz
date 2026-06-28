import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Alamat Email Pengguna', example: 'owner@igstore.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @ApiProperty({ description: 'Kata Sandi Akun', example: 'PasswordSecure123!' })
  @IsString()
  @MinLength(8, { message: 'Password minimal terdiri dari 8 karakter' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password: string;
}
