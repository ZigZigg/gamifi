import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as _ from 'lodash';

import { AppConfig } from '../../common/constants/constants';
import { ConfigService } from '../../common/services/config.service';
import { LoggerFactory } from '../../common/services/logger.service';

import { Account, ObjectOfAccount } from '../../database/models/entities';

@Injectable()
export class AccountService {
  private readonly logger = LoggerFactory.create(this.constructor.name);
  constructor(
    @InjectRepository(Account, AppConfig.DB)
    private readonly accountRepository: Repository<Account>,
    @InjectEntityManager(AppConfig.DB)
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  // Account method
  async createAccount(obj: {
    [K in keyof ObjectOfAccount]?: ObjectOfAccount[K];
  }) {
    const account = await this.accountRepository.create(obj);
    return await this.accountRepository.save(account);
  }

  async getAccountByField(obj: {
    [K in keyof ObjectOfAccount]?: ObjectOfAccount[K];
  }) {
    return await this.accountRepository.findOneBy(obj);
  }

  async updateAccount(
    cond: { [K in keyof ObjectOfAccount]?: ObjectOfAccount[K] },
    obj: { [K in keyof ObjectOfAccount]?: ObjectOfAccount[K] },
  ) {
    const list = await this.accountRepository.findBy(cond);

    if (_.size(list) === 0) {
      return;
    }

    const ups = _.map(list, (i) => {
      return { ...i, ...obj };
    });

    return await this.accountRepository.save(ups);
  }

  async deleteAccount(cond: {
    [K in keyof ObjectOfAccount]?: ObjectOfAccount[K];
  }) {
    return await this.accountRepository.delete(cond);
  }
}
