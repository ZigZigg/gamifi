import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Repository,
  Between,
  LessThan,
  IsNull,
  And,
  Not,
} from 'typeorm';
import * as _ from 'lodash';
import * as moment from 'moment';

import {
  AppConfig,
} from '../../common/constants/constants';
import { ErrorCode } from '../../common/constants/errors';
import { ApiError } from '../../common/classes/api-error';
import { LoggerFactory } from '../../common/services/logger.service';
import { CommonService } from '../../common/services/common.service';

import {
  User,
  UserStatus,
  ObjectOfUser,
  UserActivityType,
  UserActivity,
  UserCampaign,
  UserRole,
  EmailType,
} from '../../database/models/entities';
import {
  GetUserProfile,
  SearchUserDTO,
  SubNewsLetterPayload,
  UpdateUserDTO,
} from '../dtos/user.dto';
// import { EmailRepository } from '../../microservices/repositories/email.repository';
import { ValidateUniqueUserDto } from '../dtos/user.dto';
import { ErrorMessage } from '../../common/constants/error-messages';
import { UserValidateUniqueMapping } from '../dtos/constant';
// import {
//   TicketRepository,
//   Type as TicketTypeCMD,
// } from '../../microservices/repositories/ticket.repository';
import { TokenUserInfo } from '../../auth/dtos/token-user-info.dto';
// import {
//   WidgetRepository,
//   Commands as WidgetCommands,
// } from '../../microservices/repositories/widget.repository';
import { TimeLog } from '../../database/models/time-log.entity';
import { SearchUserCampaignPageDTO } from '../dtos/admin.dto';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EmailSentEvent,
  SubscriberUpdatedEvent,
} from '../../common/dtos/events';
import { SendMailVerifyEmailDto } from '../../auth/dtos';

/**
 * Service class for managing user-related operations.
 */
@Injectable()
export class UserService {
  private readonly logger = LoggerFactory.create(this.constructor.name);
  constructor(
    @InjectRepository(User, AppConfig.DB)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserActivity, AppConfig.DB)
    private readonly userActivityRepository: Repository<UserActivity>,
    @InjectRepository(TimeLog, AppConfig.DB)
    private readonly timeLogRepository: Repository<TimeLog>,
    @InjectRepository(UserCampaign, AppConfig.DB)
    private readonly userCampaignRepository: Repository<UserCampaign>,
    @InjectEntityManager(AppConfig.DB)
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,

    private eventEmitter: EventEmitter2,
    // private readonly emailRep: EmailRepository,
    // private readonly ticketRep: TicketRepository
    // private readonly widgetRep: WidgetRepository,
  ) {}

  /**
   * Creates a new user using the provided object properties.
   *
   * @async
   * @param {ObjectOfUser} obj - An object containing properties of the user.
   * @returns {Promise<User>} - A promise that resolves to the created user object.
   */
  async createUser(obj: {
    [K in keyof ObjectOfUser]?: ObjectOfUser[K];
  }): Promise<User | null> {
    let newUser = null;
    await this.entityManager.transaction(async (transaction) => {
      const userEntity = await transaction.create(User, obj);
      newUser = await transaction.save(User, userEntity);
      if (obj.campaign)
        await transaction.save(UserCampaign, {
          userId: newUser.id,
          campaign: obj.campaign,
        });
    });
    return newUser;
  }


  /**
   * Retrieves a user based on the specified field(s).
   *
   * @async
   * @param {ObjectOfUser} obj - An object containing the field(s) to search for.
   * @returns {Promise<User | null>} - A Promise that resolves to the user object if found, or null if not found.
   * @throws {Error} Throws an error if there is an issue with retrieving the user from the cache or database.
   */
  async getUserByField(
    obj:
      | {
          [K in keyof ObjectOfUser]?: ObjectOfUser[K];
        }
      | {
          [K in keyof ObjectOfUser]?: ObjectOfUser[K];
        }[],
  ): Promise<User | null> {
    return this.userRepository.findOneBy(obj);
  }

  /**
   * Updates user records based on the specified conditions and sets new values for the specified fields.
   *
   * @async
   * @param {ObjectOfUser} cond - An object containing conditions to identify the user(s) to be updated.
   * @param {UpdateUserDTO} obj - An object containing new field-value pairs to update in the user entity.
   * @returns {Promise<boolean>} A Promise that resolves once the update operation is complete.
   *
   * @throws {Error} Throws an error if there is an issue with retrieving or updating the user records.
   *
   */
  async updateUser(
    cond: { [K in keyof ObjectOfUser]?: ObjectOfUser[K] },
    obj: { [K in keyof UpdateUserDTO]?: UpdateUserDTO[K] },
    userRoleRequest?: UserRole,
    isUpdateProfile: boolean = false,
  ): Promise<
    | boolean
    | {
        updateUser: boolean;
        receiveTicket: boolean;
        sendMailVerifyEmail: boolean;
      }
  > {
    const user = await this.userRepository.findOneBy(cond);

    if (!user) {
      return;
    }

    if (obj.email) {
      await this.validateUnique(user.id, { email: obj.email });
    }
    await this.userRepository.save({ ...user, ...obj });

    return true;
  }

  async sendMailVerifyEmail(body: SendMailVerifyEmailDto) {
    const { email, userId, name } = body;
    const payload = {
      email,
      userId,
      expireAt: moment().add(10, 'minutes').toDate(),
    };

    this.eventEmitter.emit(
      'email.sent',
      new EmailSentEvent(
        {
          email,
          name,
          token: this.jwtService.sign(payload),
        },
        EmailType.VERIFY,
      ),
    );
    return true;
  }

  /**
   * Deletes a user based on the specified condition.
   * 
   * @async
   * @param {ObjectOfUser} cond - The condition to match the user(s) to be deleted.
   
   * @param {boolean} [isHard=false] - A flag indicating whether to perform a hard delete or a soft delete.
   * If true, performs a hard delete by directly removing records from the database.
   * If false (default), performs a soft delete by updating the 'deletedAt' and 'status' fields.
   * 
   * @returns A promise that resolves to the result of the delete or update operation.
   * @throws {Error} Throws an error if there is an issue with deleting or updating the user records.
   */
  async deleteUser(
    cond: { [K in keyof ObjectOfUser]?: ObjectOfUser[K] },
    isHard = false,
  ) {
    if (isHard) {
      return await this.userRepository.delete(cond);
    } else {
      return await this.userRepository.update(cond, {
        deletedAt: moment().format('YYYY-MM-DD H:m:s'),
        status: UserStatus.DELETED,
      });
    }
  }

  /**
   * Logs in a user with a password.
   *
   * @async
   * @param {string} password - The password to validate.
   * @param {ObjectOfUser} cond - The condition to find the user by field.
   * @returns {Promise<boolean>} A Promise that resolves to true if the password is valid, false if not,
   * or null if the user is not found based on the specified conditions.
   * @throws {Error} Throws an error if there is an issue with retrieving the user or validating the password
   */
  async loginWithPassword(
    password: string,
    cond: { [K in keyof ObjectOfUser]?: ObjectOfUser[K] },
  ): Promise<boolean> {
    const user = await this.getUserByField(cond);

    if (!user) return null;

    return await user.validatePassword(password);
  }

  /**
   * Searches for users based on specified criteria such as keyword, searchBy fields, filters, limit, and offset.
   *
   * @async
   * @param {SearchUserDTO} params - An object containing search parameters.
   * @returns {Promise<Users[]>} A list of users matching the search criteria.
   * @throws {Error} Throws an error if there is an issue with executing the search query.
   */
  async searchUser(params: SearchUserDTO) {
    return {}
  }

  async searchCampaign(
    params: SearchUserCampaignPageDTO,
  ): Promise<{ campaigns: { id: number; name: string }[]; total: number }> {
    const { limit, offset, sortBy, sortDirection } = params;
    const queryBuilder = this.userCampaignRepository
      .createQueryBuilder('uc')
      .select('uc.id as id')
      .addSelect(`CONCAT(uc.campaign, ' - ', username)`, 'name')
      .leftJoin(User, 'u', 'uc.userId = u.id')
      .orderBy(sortBy, sortDirection);

    const [campaigns, total] = await Promise.all([
      queryBuilder
        .limit(limit)
        .offset(offset)
        .getRawMany<{ id: number; name: string }>(),
      queryBuilder.clone().getCount(),
    ]);

    return {
      campaigns,
      total,
    };
  }

  /**
   * Changes the password of a user.
   *
   * @async
   * @param {ObjectOfUser} cond - The conditions to find the user.
   * @param {ObjectOfUser} user - The updated user object.
   * @param {string} oldPassword - The old password for verification (optional).
   * @returns {Promise<User>} The updated user object.
   * @throws {ApiError} If the user is not found or the old password is incorrect.
   */
  async changePassword(
    cond: { [K in keyof ObjectOfUser]?: ObjectOfUser[K] },
    user: { [K in keyof ObjectOfUser]?: ObjectOfUser[K] },
    oldPassword?: string,
  ): Promise<User> {
    const userInfo = await this.userRepository.findOneBy({
      ...cond,
      status: UserStatus.ACTIVE,
    });

    if (!userInfo) throw new ApiError(ErrorCode.USER_NOT_FOUND);

    if (oldPassword && !(await userInfo.validatePassword(oldPassword))) {
      throw new ApiError(ErrorCode.CURRENT_PASSWORD_INCORRECT);
    }

    userInfo.password = user.password;

    return await this.userRepository.save(userInfo);
  }

  /**
   * Validates the uniqueness of the given payload properties in the user repository.
   * If any of the fields already exists, it throws an ApiError with a corresponding error message.
   * Otherwise, it returns true, indicating that the values are unique.
   * @param payload - The payload containing the properties to validate.
   * @returns A boolean indicating whether the payload properties are unique or not.
   * @throws ApiError if any of the payload properties already exist in the user repository.
   */
  async validateUnique(
    userId: number,
    payload: {
      [K in keyof ValidateUniqueUserDto]?: ValidateUniqueUserDto[K];
    },
  ): Promise<boolean> {
    for (const [key, value] of Object.entries(payload)) {
      const user = await this.userRepository.findOneBy({
        [key]: value,
        id: Not(userId),
      });

      if (user) {
        throw new ApiError(
          ErrorMessage.FIELD_EXISTED(UserValidateUniqueMapping[key]),
        );
      }
    }
    return true;
  }


  async logActivity(userId: number, type: UserActivityType) {
    const start = moment().startOf('day').toDate();
    const end = moment().endOf('day').toDate();
    const ex = await this.userActivityRepository.findOneBy({
      userId,
      createdAt: Between(start, end),
      type,
    });

    if (ex) return;

    const create = this.userActivityRepository.create({
      userId,
      type,
    });

    return await this.userActivityRepository.save(create);
  }

  async endSession(userId: number) {
    const lastTimeLogTodayOfUser = await this.timeLogRepository.findOneBy({
      userId,
      startTime: CommonService.findOperatorInToday(),
      endTime: IsNull(),
    });

    return this.timeLogRepository.update(
      { id: lastTimeLogTodayOfUser.id },
      {
        duration: moment().diff(lastTimeLogTodayOfUser.startTime, 'seconds'),
        endTime: moment().toDate(),
      },
    );
  }

  async logAverageTime(userId: number) {
    const BLOCK_TIME_IN_SECONDS = AppConfig.CHART.BLOCK_SESSION;
    const lastTimeLogTodayOfUser = await this.timeLogRepository.findOneBy({
      userId,
      startTime: CommonService.findOperatorInToday(),
      endTime: IsNull(),
    });

    const nowInDate = moment().toDate();
    if (_.isEmpty(lastTimeLogTodayOfUser)) {
      const timeLog = this.timeLogRepository.create({
        userId,
        startTime: nowInDate,
      });
      return this.timeLogRepository.save(timeLog);
    }

    if (
      moment().isAfter(
        moment(lastTimeLogTodayOfUser.startTime).add(
          BLOCK_TIME_IN_SECONDS,
          'seconds',
        ),
      )
    ) {
      await this.timeLogRepository.update(
        { id: lastTimeLogTodayOfUser.id },
        {
          duration: moment().diff(lastTimeLogTodayOfUser.startTime, 'seconds'),
          endTime: moment().toDate(),
        },
      );
      const timeLog = this.timeLogRepository.create({
        userId,
        startTime: nowInDate,
      });
      return this.timeLogRepository.save(timeLog);
    }
    return true;
  }

  async runUpdateSession() {
    const BLOCK_TIME_IN_SECONDS = AppConfig.CHART.BLOCK_SESSION;
    const yesterday = moment().subtract(1, 'days').toDate();
    const timeLogsYesterday = await this.timeLogRepository.findBy({
      startTime: CommonService.findOperatorInToday(yesterday),
      endTime: IsNull(),
    });

    if (!_.isEmpty(timeLogsYesterday)) {
      await Promise.all(
        timeLogsYesterday.map((tl) => {
          this.timeLogRepository.update(
            { id: tl.id },
            {
              duration: moment().diff(tl.startTime, 'seconds'),
              endTime: moment().subtract(1, 'day').endOf('day').toDate(),
            },
          );
        }),
      );
    }

    const lastTimeLogsToday = await this.timeLogRepository.findBy({
      startTime: And(
        LessThan(moment().subtract(BLOCK_TIME_IN_SECONDS, 'seconds').toDate()),
        CommonService.findOperatorInToday(),
      ),
      endTime: IsNull(),
    });

    if (!_.isEmpty(lastTimeLogsToday)) {
      await Promise.all(
        lastTimeLogsToday.map((tl) => {
          this.timeLogRepository.update(
            { id: tl.id },
            {
              duration: moment().diff(tl.startTime, 'seconds'),
              endTime: moment().toDate(),
            },
          );
        }),
      );
    }
  }

  async getUserCampaign(userId: number): Promise<{ campaign: string }> {
    const userCampaign = await this.userCampaignRepository.findOneBy({
      userId,
    });
    return { campaign: userCampaign ? userCampaign.campaign : '' };
  }
}
