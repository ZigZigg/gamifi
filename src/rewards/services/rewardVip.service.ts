import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { AppConfig } from 'src/common/constants/constants';
import { EntityManager, Repository } from 'typeorm';
import { ApiError } from 'src/common/classes/api-error';
import { Rewards } from 'src/database/models/rewards.entity';
import { MasterData } from 'src/database/models/master-data.entity';
import { RequestVipRewardDto } from '../dtos/request/reward.request.dto';
import { RewardError } from '../constants/errors';
import { ConfigService } from 'src/common/services/config.service';
import { MasterService } from './master.service';
import { RewardVip, RewardVipStatus } from 'src/database/models/reward-vip.entity';
import { BasePageDTO } from 'src/common/classes/pagination.dto';

@Injectable()
export class RewardVipService {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectEntityManager(AppConfig.DB)
        private readonly entityManager: EntityManager,
        @InjectRepository(RewardVip, AppConfig.DB)
        private readonly rewardVipRepository: Repository<RewardVip>,
        @InjectRepository(Rewards, AppConfig.DB)
        private readonly rewardRepository: Repository<Rewards>,
        @InjectRepository(MasterData, AppConfig.DB)
        private readonly masterRepository: Repository<MasterData>,
        private readonly configService: ConfigService,
        private readonly masterDataService: MasterService,
    ) { }

    async createVip(body: RequestVipRewardDto){
        const {rewardId, status} = body

        // Check if reward exist
        const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });
        if (!reward) {
            throw new ApiError(RewardError.REWARD_NOT_FOUND)
        }
        const result = await this.entityManager.transaction(async (transactionalEntityManager) => {
            const rewardVipObject = {
                ...body,
                reward: rewardId as any,
                status: status || RewardVipStatus.PENDING
            }
            const reward = await transactionalEntityManager.save(RewardVip, rewardVipObject);

            return reward;
        })
        return result;
    }
    async updateVip(id: string, body: RequestVipRewardDto){
        const {phoneNumber, rewardId} = body

        // Check if reward exist
        const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });
        if (!reward) {
            throw new ApiError(RewardError.REWARD_NOT_FOUND)
        }
        const result = await this.entityManager.transaction(async (transactionalEntityManager) => {
            const rewardVipObject = {
                ...body,
                reward: rewardId as any
            }
            const reward = await transactionalEntityManager.update(RewardVip, {id},  rewardVipObject);

            return reward;
        })
        return result;
    }
    async deleteVip(id: string){
        const result = await this.entityManager.transaction(async (transactionalEntityManager) => {
            const deleteResult = await this.rewardVipRepository.delete({ id: parseInt(id) });
            return deleteResult;
        })
        return result;
    }


    async getList(params: BasePageDTO) {
        const { limit, offset } = params

        let queryBuilder = this.rewardVipRepository.createQueryBuilder('rv')
            .select('rv.*')


        // Get turn type object
        queryBuilder.leftJoin(
            Rewards,
            'rw',
            `rw."id" = rv."rewardId"`,
        )
            .addSelect(
                ` json_build_object('id', rw.id, 'type', rw."type", 'value', rw.value, 'turnTypeId', rw."turnTypeId") as reward`,
            );

        queryBuilder.leftJoin(
            MasterData,
            'md',
            `md."id" = rw."turnTypeId"`,
        )
            .addSelect(
                ` json_build_object('id', md.id, 'name', md."name", 'value', md.value) as turnType`,
            );
        queryBuilder.orderBy('id', 'ASC').limit(limit).offset(offset);
        const [results, count] = await Promise.all([
            queryBuilder.getRawMany(),
            queryBuilder.getCount(),
        ]);
        return {
            records: results,
            total: count,
        };
    }
}