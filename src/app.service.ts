import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from './common/constants/constants';
import { User } from './database/models/entities';
import { ConfigService } from './common/services/config.service';
import { createClient } from 'redis';

@Injectable()
export class HealthCheckService {
  constructor(
    @InjectRepository(User, AppConfig.DB)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async checkPostgres(): Promise<boolean> {
    try {
      await this.userRepository.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkRedis(): Promise<boolean> {
    try {
      const redisConfig = this.configService.redis;
      const cacheConnection = createClient({
        url: `redis://${redisConfig.host}:${redisConfig.port}`,
      });

      // Connect to Redis
      await cacheConnection.connect();

      console.log('Connected to Redis');

      // PING command
      console.log('\nCache command: PING');
      console.log('Cache response : ' + (await cacheConnection.ping()));

      // GET
      console.log('\nCache command: GET Message');
      console.log('Cache response : ' + (await cacheConnection.get('Message')));

      // SET
      console.log('\nCache command: SET Message');
      console.log(
        'Cache response : ' +
          (await cacheConnection.set(
            'Message',
            'Hello! The cache is working from Node.js!',
          )),
      );

      // GET again
      console.log('\nCache command: GET Message');
      console.log('Cache response : ' + (await cacheConnection.get('Message')));

      // Disconnect
      cacheConnection.disconnect();
      return true;
    } catch (error) {
      return false;
    }
  }
}
