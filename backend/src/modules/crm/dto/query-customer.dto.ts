import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCustomerDto {
  @ApiPropertyOptional({ description: 'Halaman data ke-n', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Jumlah data per halaman', example: 10, default: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Kata kunci pencarian (nama, telepon, email)', example: 'Budi' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Saring berdasarkan status', example: 'LEAD' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Saring berdasarkan tag tunggal', example: 'VIP' })
  @IsString()
  @IsOptional()
  tag?: string;
}
