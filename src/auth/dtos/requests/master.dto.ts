import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum Flatfrom {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export class VersionDTO {
  @IsNotEmpty()
  @IsEnum(Flatfrom)
  @ApiProperty({ type: Flatfrom, enum: Flatfrom, default: Flatfrom.IOS })
  readonly flatfrom: Flatfrom;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly version: string;
}
