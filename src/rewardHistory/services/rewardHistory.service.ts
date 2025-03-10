import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenUserInfo } from 'src/auth/dtos';
import { AppConfig } from 'src/common/constants/constants';
import { CommonService } from 'src/common/services/common.service';
import { RewardHistory } from 'src/database/models/reward-history.entity';
import { Brackets, Repository } from 'typeorm';
import { SearchRewardHistoryRequestDto } from '../dtos/request/rewardHistory.request';
import { User } from 'src/database/models/user.entity';
import { MasterData } from 'src/database/models/master-data.entity';
import { Rewards } from 'src/database/models/rewards.entity';
import { Workbook } from 'exceljs';
import * as moment from 'moment';
import { Readable, Writable } from 'stream';
import { pipeline } from 'stream/promises';

@Injectable()
export class RewardHistoryService {
  constructor(
    @InjectRepository(RewardHistory, AppConfig.DB)
    private readonly rewardHistoryRepository: Repository<RewardHistory>,
  ) { }

  async getList(params: SearchRewardHistoryRequestDto) {
    const { limit, offset, phoneNumber, fullName, rewardType, startDate, endDate, isExport } = params

    let queryBuilder = this.rewardHistoryRepository.createQueryBuilder('rh')
      .select('rh.*')

    // Get User object
    queryBuilder.leftJoin(
      User,
      'u',
      `u."id" = rh."userId"`,
    )
      .addSelect(
        ` json_build_object('id', u.id, 'fullName', u."full_name", 'phoneNumber', u.phone_number) as user`,
      );

    // Get Reward object
    queryBuilder.leftJoin(
      Rewards,
      'rw',
      `rw."id" = rh."rewardId"`,
    )
      .addSelect(
        ` json_build_object('id', rw.id, 'turnTypeId', rw."turnTypeId", 'value', rw.value) as reward`,
      );

    // // Get Reward type object
    queryBuilder.leftJoin(
      MasterData,
      'md',
      `md."id" = rw."turnTypeId"`,
    )
      .addSelect(
        ` json_build_object('id', md.id, 'name', md."name", 'value', md.value) as turnType`,
      );

    // Filter by phone number of user
    if (phoneNumber) {
      queryBuilder.andWhere(`u.phone_number ILIKE :phoneNumber`, {
        phoneNumber: `%${phoneNumber}%`,
      });
    }

    // Filter by full name of user
    if (fullName) {
      queryBuilder.andWhere(`u.full_name ILIKE :fullName`, {
        fullName: `%${fullName}%`,
      });
    }
    if (rewardType) {
      queryBuilder.andWhere(`md."id" = :turnTypeId`, { turnTypeId: rewardType });
    }
    // Filter with receive date
    if (startDate || endDate) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          if (startDate) {
            qb.where(`"receive_date" >= :startDate`, {
              startDate: moment(startDate).subtract(7, 'hours').toISOString(),
            });
          }
          if (endDate) {
            qb.andWhere(`"receive_date" <= :endDate`, {
              endDate: moment(endDate).subtract(7, 'hours').toISOString(),
            });
          }
        }),
      );
    }
    if (isExport) {
      queryBuilder.orderBy('created_at', 'DESC');
    } else {
      queryBuilder.orderBy('created_at', 'DESC').limit(limit).offset(offset);
    }
    const [results, count] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
    ]);
    const currentResult = results.map((result) => {
      return {
        ...result,
        receive_date: moment(result.receive_date).add(7, 'hours').format()
      }
    })
    return {
      records: currentResult,
      total: count,
    };
  }

  async getRewardHistoryFromUser(user: TokenUserInfo) {
    // Get reward history from user
    const rewardHistory = await this.rewardHistoryRepository.find({
      where: { user: { id: user.id } },
      relations: ['reward', 'reward.turnType']
    });
    let currentRewardHistory = rewardHistory.map((rewardHistory) => {
      const reward = rewardHistory.reward;
      const rewardType = CommonService.rewardIntoEnumString(reward)
      return {
        ...rewardHistory,
        rewardType
      }
    })

    // const findAirPodReward = currentRewardHistory.find((item) => item.reward?.turnType.value === 'AIRPOD_DEVICE');
    // if(findAirPodReward){ 
    //   currentRewardHistory = currentRewardHistory.filter((item) => !['AIRPOD_PIECE_1','AIRPOD_PIECE_2','AIRPOD_PIECE_3'].includes(item.reward?.turnType.value));
    // }

    // const findIphoneReward = currentRewardHistory.find((item) => item.reward?.turnType.value === 'IPHONE_DEVICE');
    // if(findIphoneReward){
    //   currentRewardHistory = currentRewardHistory.filter((item) => !['IP_PIECE_1','IP_PIECE_2','IP_PIECE_3'].includes(item.reward?.turnType.value));
    // }
    // Group reward and count rewardHistory inside each group
    const groupedRewardHistory = currentRewardHistory.reduce((acc, curr) => {
      const rewardTypeKey = curr.rewardType;
      if (!acc[rewardTypeKey.key]) {
        acc[rewardTypeKey.key] = { reward: curr.reward, count: 0, name: rewardTypeKey.text };
      }
      acc[rewardTypeKey.key].count += 1;
      return acc;
    }, {});

    // Convert groupedRewardHistory object to an array
    const rewardHistoryArray = Object.values(groupedRewardHistory);
    return rewardHistoryArray;

  }

  async getListHistoryWithExport(params: SearchRewardHistoryRequestDto){
    const { limit, offset, phoneNumber, fullName, rewardType, startDate, endDate, isExport } = params;

    let queryBuilder = this.rewardHistoryRepository.createQueryBuilder('rh')
      .select('rh.*')
      .leftJoin(User, 'u', `u."id" = rh."userId"`)
      .addSelect(`json_build_object('id', u.id, 'fullName', u."full_name", 'phoneNumber', u.phone_number) as user`)
      .leftJoin(Rewards, 'rw', `rw."id" = rh."rewardId"`)
      .addSelect(`json_build_object('id', rw.id, 'turnTypeId', rw."turnTypeId", 'value', rw.value) as reward`)
      .leftJoin(MasterData, 'md', `md."id" = rw."turnTypeId"`)
      .addSelect(`json_build_object('id', md.id, 'name', md."name", 'value', md.value) as turnType`);

    if (phoneNumber) {
      queryBuilder.andWhere(`u.phone_number ILIKE :phoneNumber`, { phoneNumber: `%${phoneNumber}%` });
    }

    if (fullName) {
      queryBuilder.andWhere(`u.full_name ILIKE :fullName`, { fullName: `%${fullName}%` });
    }

    if (rewardType) {
      queryBuilder.andWhere(`md."id" = :turnTypeId`, { turnTypeId: rewardType });
    }

    if (startDate || endDate) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          if (startDate) {
            qb.where(`"receive_date" >= :startDate`, { startDate: moment(startDate).subtract(7, 'hours').toISOString() });
          }
          if (endDate) {
            qb.andWhere(`"receive_date" <= :endDate`, { endDate: moment(endDate).subtract(7, 'hours').toISOString() });
          }
        }),
      );
    }

    queryBuilder.orderBy('created_at', 'DESC');

    if (!isExport) {
      queryBuilder.limit(limit).offset(offset);
    }

    return queryBuilder.stream();
  }

  async generateAndExportData(params: SearchRewardHistoryRequestDto) {
    const stream = await this.getListHistoryWithExport({ ...params, isExport: true });
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    worksheet.columns = [
      { header: 'Số điện thoại', key: 'phoneNumber', width: 50 },
      { header: 'Họ tên', key: 'fullName', width: 50 },
      { header: 'Loại quà', key: 'rewardType', width: 50 },
      { header: 'Giá trị quà', key: 'rewardValue', width: 50 },
      { header: 'Ghi chú', key: 'note', width: 100 },
      { header: 'Ngày nhận quà', key: 'receiveDate', width: 50 },
    ];

    const transformStream = new Readable({
      objectMode: true,
      read() {}
    });

    stream.on('data', (record: any) => {
      const formattedRecord = {
        phoneNumber: record.user?.phoneNumber || '-',
        fullName: record.user?.fullName || '-',
        rewardType: record.turntype?.name || '-',
        rewardValue: record.reward?.value || '-',
        note: record.note || '-',
        receiveDate: moment(record.receive_date).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') || '-',
      };
      transformStream.push(formattedRecord);
    });

    stream.on('end', () => {
      transformStream.push(null);
    });
    const writableStream = new Writable({
      objectMode: true,
      write(record, encoding, callback) {
        worksheet.addRow(record);
        callback();
      }
    });

    await pipeline(
      transformStream,
      writableStream
    );

    const fileBuffer = await workbook.xlsx.writeBuffer();
    return fileBuffer;
  }

}