import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppConfig, REDIS_KEY } from 'src/common/constants/constants';
import { RedisClientService } from 'src/common/services/redis.service';
import { MasterData } from 'src/database/models/master-data.entity';
import { Repository, Not } from 'typeorm';

@Injectable()
export class MasterService {
    constructor(
        @InjectRepository(MasterData, AppConfig.DB)
        private readonly masterRepository: Repository<MasterData>,
    private readonly redisClient: RedisClientService,

    ){

    }

    async getMasterDataFromCache(){
        const key = REDIS_KEY.MASTER_DATA_LIST
        const cachedMasterData = await this.redisClient.get(key);
        if (cachedMasterData) {
          return cachedMasterData;
        }

        // Get list master data from database, ignore value = GOOD_LUCK
        const masterData = await this.masterRepository.find();

        this.redisClient.set(key, masterData, AppConfig.REDIS_TTL);

        return masterData;
    }
}