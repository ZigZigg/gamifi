import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as _ from 'lodash';

import { AppConfig } from '../../common/constants/constants';
import { ConfigService } from '../../common/services/config.service';
import { LoggerFactory } from '../../common/services/logger.service';

import {
  Master,
  ObjectOfMaster,
  Key,
  Flatfrom,
} from '../../database/models/entities';

@Injectable()
export class MasterService {
  private readonly logger = LoggerFactory.create(this.constructor.name);
  constructor(
    @InjectRepository(Master, AppConfig.DB)
    private readonly masterRepository: Repository<Master>,
    @InjectEntityManager(AppConfig.DB)
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  // User method
  async create(obj: { [K in keyof ObjectOfMaster]?: ObjectOfMaster[K] }) {
    const user = await this.masterRepository.create(obj);
    return await this.masterRepository.save(user);
  }

  async getByField(obj: { [K in keyof ObjectOfMaster]?: ObjectOfMaster[K] }) {
    return await this.masterRepository.findOneBy(obj);
  }

  async update(
    cond: { [K in keyof ObjectOfMaster]?: ObjectOfMaster[K] },
    obj: { [K in keyof ObjectOfMaster]?: ObjectOfMaster[K] },
  ) {
    return await this.masterRepository.update(cond, obj);
  }

  async delete(cond: { [K in keyof ObjectOfMaster]?: ObjectOfMaster[K] }) {
    return await this.masterRepository.delete(cond);
  }

  async checkVersion(flatfrom: Flatfrom, version: string) {
    const config = await this.getByField({ key: Key.VERSION });

    if (!config) return;

    const vOfFlatfrom = config.value[flatfrom];

    if (!vOfFlatfrom) return;

    let force = false;
    let last = version;

    for (const v of vOfFlatfrom) {
      const vNum = _.parseInt(v.version.replace(/\./g, ''));
      const cvNum = _.parseInt(version.replace(/\./g, ''));

      if (vNum <= cvNum) {
        continue;
      }

      if (v.isForce) {
        force = v.isForce;
      }

      last = v.version;
    }

    return { force, last };
  }
}
