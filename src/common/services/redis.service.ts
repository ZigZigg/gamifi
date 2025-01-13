import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisClientService {
  private readonly redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }

  /**
   * Retrieves a value from Redis cache based on the specified key.
   *
   * @async
   * @template T - The type of the value to be retrieved.
   * @param {string} key - The key to retrieve the value for.
   * @returns {Promise<T | undefined>} A Promise that resolves to the retrieved value if found, or undefined if the key does not exist.
   * @throws {Error} Throws an error if there is an issue with retrieving the value from the Redis cache or parsing the JSON.
   */
  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.redis.get(key);
    if (!value) return undefined;
    return JSON.parse(value);
  }

  /**
   * Sets a value in Redis with an optional expiration time.
   *
   * @template T - The type of the value to be stored.
   *
   * @param {string} key - The key to set the value for.
   * @param {T} value - The value to set.
   *
   * @param {number} [time=60] - The expiration time for the key-value pair in seconds.
   *   If set to 0, the key-value pair will not have an expiration time.
   *
   * @returns {Promise<any>} A Promise that resolves once the value is successfully stored in the Redis cache.
   * @throws {Error} Throws an error if there is an issue with setting the value in the Redis cache or if the time parameter is invalid.
   */
  async set<T>(key: string, value: T, time = 60): Promise<any> {
    if (time === 0) return this.redis.set(key, JSON.stringify(value));
    return this.redis.set(key, JSON.stringify(value), 'EX', time);
  }

  /**
   * Deletes a key-value pair from the Redis cache based on the provided key.
   *
   * @param {string} key - The key associated with the value to be deleted from the Redis cache.
   * @returns {Promise<number>} A Promise that resolves to the number of keys deleted (1 if the key existed, 0 if not).
   * @throws {Error} Throws an error if there is an issue with deleting the key-value pair from the Redis cache.
   */
  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }
}
