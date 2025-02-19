import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { BasePageDTO } from "src/common/classes/pagination.dto";
import { RewardWinningType, TurnType } from "src/database/models/rewards.entity";

export class RewardUpdateRequestDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    turnTypeId: number;

    @ApiProperty({
        type: 'enum',
        required: true,
        enum: TurnType,
        default: TurnType.FREE,
      })
    @IsNotEmpty()
    @IsEnum(TurnType)
    @IsOptional()
    type: TurnType;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    value: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    quantity: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    holdQuantity: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    winningRate: number;      

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    campaign: number;
}

export class RequestVipRewardDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  rewardId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
export class RewardRequestDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    turnTypeId: number;

    @ApiProperty({
        type: 'enum',
        required: true,
        enum: TurnType,
        default: TurnType.FREE,
      })
    @IsNotEmpty()
    @IsEnum(TurnType)
    type: TurnType;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    value: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty()
    @IsNumber()
    holdQuantity: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    winningRate: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    campaign: number;
}

export class SpinRewardRequestDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    spinTypeNumber: number;

    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    @IsNotEmpty()
    readonly tokenSso: string;
  
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    @IsNotEmpty()
    readonly ctkmId: string;
}

export class SearchRewardRequestDto extends BasePageDTO {
  @ApiProperty({
    type: 'enum',
    required: true,
    enum: TurnType,
    default: TurnType.FREE,
  })
  @IsNotEmpty()
  @IsEnum(TurnType)
  type: TurnType;
}

export class CraftRewardRequestDto {
  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  rewardIds: number[];
}