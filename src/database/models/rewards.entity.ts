import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MasterData } from './master-data.entity';
import { Campaign } from './campaign.entity';

export enum TurnType {
  FREE='FREE',
  PAID='PAID'
}

@Entity('rewards')
export class Rewards {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MasterData, { nullable: false })
  turnType: MasterData;

  @Column()
  value: string;

  @Column({ type: 'bigint', default: 0 })
  quantity: number;

  @Column({ type: 'bigint', name: 'hold_quantity', default: 0 })
  holdQuantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 8, name: 'winning_rate' })
  winningRate: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: TurnType,
    default: TurnType.FREE,
  })
  type: TurnType;

  @ManyToOne(() => Campaign, { nullable: false })
  campaign: Campaign;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ type: 'string', format: 'date-time', name: 'updated_at' })
  updatedAt: Date;
}