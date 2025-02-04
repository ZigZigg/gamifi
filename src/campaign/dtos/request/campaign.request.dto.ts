import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CampaignStatus } from "src/database/models/campaign.entity";
export class CampaignRequestDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ required: true, example: '2024-04-29 10:26:21' })
    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @ApiProperty({ required: true, example: '2024-04-29 10:26:21' })
    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @ApiProperty({ required: true, example: '2024-04-29 10:26:21' })
    @IsNotEmpty()
    @IsDateString()
    startDateHold: string;

    @ApiProperty({ required: true, example: '2024-04-29 10:26:21' })
    @IsNotEmpty()
    @IsDateString()
    endDateHold: string;

    @ApiProperty({
        type: 'enum',
        required: true,
        enum: CampaignStatus,
        default: CampaignStatus.ACTIVE,
      })
    @IsNotEmpty()
    @IsEnum(CampaignStatus)
    status: CampaignStatus;
}

export class CampaignUpdateRequestDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ required: true, example: '2024-04-29 10:26:21' })
  @IsOptional()
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: true, example: '2024-04-29 10:26:21' })
  @IsOptional()
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: true, example: '2024-04-29 10:26:21' })
  @IsOptional()
  @IsDateString()
  startDateHold: string;

  @ApiProperty({ required: true, example: '2024-04-29 10:26:21' })
  @IsOptional()
  @IsDateString()
  endDateHold: string;

  @ApiProperty({
      type: 'enum',
      required: true,
      enum: CampaignStatus,
      default: CampaignStatus.ACTIVE,
    })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status: CampaignStatus;
}