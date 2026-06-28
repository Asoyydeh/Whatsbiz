import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nama Anggota Tim', example: 'Siti Rahma' })
  @IsString()
  @IsNotEmpty({ message: 'Nama anggota wajib diisi' })
  name: string;

  @ApiProperty({ description: 'Email Anggota Tim', example: 'siti@igstore.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @ApiProperty({ description: 'Password Anggota', example: 'PasswordSecure123!' })
  @IsString()
  @MinLength(8, { message: 'Password minimal terdiri dari 8 karakter' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password: string;

  @ApiProperty({ description: 'Peran Anggota (Role)', enum: UserRole, example: UserRole.STAFF })
  @IsEnum(UserRole, { message: 'Peran tidak valid' })
  @IsNotEmpty({ message: 'Role wajib ditentukan' })
  role: UserRole;
}
