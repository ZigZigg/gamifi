import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { RewardWinningType, TurnType } from "src/database/models/rewards.entity";

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

    @ApiProperty({
      type: 'enum',
      required: true,
      enum: RewardWinningType,
      default: RewardWinningType.BASIC,
    })
    @IsNotEmpty()
    @IsEnum(RewardWinningType)
    winningType: RewardWinningType;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    value: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    holdQuantity: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    winningRate: number;      

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    campaignId: number;
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

export class CraftRewardRequestDto {
  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  rewardIds: number[];
}