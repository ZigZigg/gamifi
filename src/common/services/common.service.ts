import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import {
  AppConfig,
  ConvertPhoneNumAction,
  ErrorCode,
  halfYearMonthValue,
  monthsOfYear,
  RewardMappingType,
} from '../constants/constants';
import * as moment from 'moment';
import { DurationInputArg2 } from 'moment';
import { ApiError } from '../classes/api-error';
import { SelectQueryBuilder } from 'typeorm';
import { Between } from 'typeorm';
import { removeHostAndQuery } from '../functions';
import { MediaTypeEnum, MetaData } from '../typeorm/base.entity';
import { Rewards } from 'src/database/models/rewards.entity';

export interface FilterOptions {
  alias?: string;
  default?: string | string[];
  isDate?: boolean;
}

export interface IConvertArray {
  key: string;
  value?: string | number | boolean | number[] | string[];
  from?: Date | number | string;
  to?: Date | number | string;
  alias?: string;
  isDate?: boolean;
}

@Injectable()
export class CommonService {
  public static escapeString(text: string) {
    const matchRegexp = /[<>"'~%|\\{}()[\]^$+*?.-]/g;
    return text?.trim().replace(matchRegexp, '\\$&');
  }

  public static escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return text.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  public static decodeUrl(val: string) {
    if (!val) return;

    return decodeURIComponent(val).trim();
  }

  public static toCamelCase<T>(
    obj: any,
    replace?: string,
    ignoreKey?: string,
  ): T {
    const converted = {};
    Object.keys(obj).forEach((snakeCasedKey) => {
      if (ignoreKey !== snakeCasedKey) {
        const key = replace
          ? snakeCasedKey.replace(replace, '')
          : snakeCasedKey;
        const cm = _.camelCase(key);

        converted[cm] = obj[snakeCasedKey];
      }
    });

    return converted as T;
  }

  public static convertArray(
    val,
    allowedFilters?: Record<string, boolean | FilterOptions>,
  ): IConvertArray[] {
    const arr = typeof val === 'string' ? [val] : val;

    return _.map(arr, (i) => {
      if (_.indexOf(i, ',') === -1) {
        return i;
      } else {
        const ar = _.split(i, ',');
        const key = ar[0];
        const value =
          _.indexOf(ar[1], '|') === -1 ? ar[1] : _.split(ar[1], '|');
        const from = ar[2];
        const to = ar[3];

        let alias, isDate;
        if (allowedFilters) {
          const options = allowedFilters[key];
          if (!options) throw new ApiError(ErrorCode.INVALID_QUERY);

          if (typeof options === 'object') {
            if (options.alias) alias = options.alias;
            if (options.isDate) isDate = options.isDate;
          }
        }

        return { key, value, from, to, alias, isDate };
      }
    });
  }

  public static random(size: number) {
    let result = '';
    const text =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = text.length;
    let i = 0;

    while (i < size) {
      result += text.charAt(Math.floor(Math.random() * length));
      i += 1;
    }

    return result;
  }

  public static phoneNumber(code, num) {
    const c = code.replace('0', '+');
    const n = num.replace('0', '');

    return _.join([c, n]);
  }

  public static convertPhoneNum(
    phoneNum: string,
    action: ConvertPhoneNumAction,
  ) {
    if (action === ConvertPhoneNumAction.ADD_PHONE_CODE)
      return AppConfig.PHONE_CODE + phoneNum;
    return phoneNum.slice(3);
  }


  /**
   * Calculates the start time of a new day relative to a given start time and number of days after the start time date.
   *
   * @param {string} startTime - The start time in the format "HH:MM:SS" (hours, minutes, seconds).
   *
   * @returns {moment.Moment} A Moment object representing the calculated start time of the new day.
   */
  public static getStartTimeOfNewDay(startTime: string): moment.Moment {
    const [hours, minutes, seconds] = startTime.split(':').map(Number);
    return moment()
      .startOf('day')
      .add(hours, 'hours')
      .add(minutes, 'minutes')
      .add(seconds, 'seconds');
  }

  /**
   * Calculates the number of days elapsed since the provided start date.
   *
   * @param {string | Date} startTimeDate - The start date from which to calculate the number of days elapsed.
   * This can be a string in the format 'YYYY-MM-DD' or a Date object.
   *
   * @returns {number} The number of days elapsed since the provided start date.
   *
   */
  public static getNumberOfDaysAfterStartTimeDate(
    startTimeDate: string | Date,
  ): number {
    return moment().date() - moment(startTimeDate, 'YYYY-MM-DD').date();
  }

  public static handleFilterQuery<K>(
    filter: IConvertArray[],
    queryBuilder: SelectQueryBuilder<K>,
  ) {
    for (const item of filter) {
      const alias = item.alias ? `"${item.alias}".` : '';
      const field = `${alias}"${item.key}"`;

      if (item.from) {
        queryBuilder.andWhere(`${field} >= :from`, {
          from: item.from,
        });
      }

      if (item.to) {
        queryBuilder.andWhere(`${field} <= :to`, { to: item.to });
      }

      if (!item.value) continue;
      const isArrVal = _.isArray(item.value);

      if (item.isDate) {
        const val = moment(isArrVal ? item.value[0] : item.value).format(
          'YYYY-MM-DD',
        );

        queryBuilder.andWhere(`Date(${field}) = :${item.key}`, {
          [item.key]: val,
        });
      } else {
        queryBuilder.andWhere(`${field} IN (:...${item.key})`, {
          [item.key]: isArrVal ? item.value : [item.value],
        });
      }
    }

    return queryBuilder;
  }

  public static handleSearchQuery<K>(
    filter: IConvertArray[],
    queryBuilder: SelectQueryBuilder<K>,
  ) {
    for (const item of filter) {
      const alias = item.alias ? `"${item.alias}".` : '';
      const field = `${alias}"${item.key}"`;

      if (!item.value) continue;

      const isArrVal = _.isArray(item.value);
      queryBuilder.andWhere(`${field} ILIKE :${item.key}`, {
        [item.key]: `%${isArrVal ? item.value[0] : item.value}%`,
      });
    }

    return queryBuilder;
  }

  public static generateRandomPassword(length = 8): string {
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialCharacters = '!@#$%^&*';

    let password = '';

    password +=
      uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];

    password +=
      lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];

    password += numbers[Math.floor(Math.random() * numbers.length)];

    password +=
      specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

    // Generate remaining random characters
    const remainingLength = length - password.length;
    const allCharacters =
      uppercaseLetters + lowercaseLetters + numbers + specialCharacters;
    for (let i = 0; i < remainingLength; i++) {
      password +=
        allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }

    // Shuffle the password characters
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    return password;
  }

  public static findOperatorInToday(date: Date = new Date()) {
    const startOfToday = moment(date).startOf('day');
    const endOfToday = moment(date).endOf('day');
    const result = Between(startOfToday.toDate(), endOfToday.toDate());
    return result;
  }

  /**
   * Masks a phone number by replacing the middle digits with asterisks.
   * @param phone The phone number to be masked.
   * @returns The masked phone number.
   */
  public static maskPhoneNumber(phone: string): string {
    const localNumber = phone.replace('+91', '');
    const phoneNumberRegex = /^(\d{3})(\d+)(\d{2})$/;
    const match = localNumber.match(phoneNumberRegex);

    if (match) {
      const formattedPhoneNumber = `${match[1]}****${match[3]}`;
      return formattedPhoneNumber;
    } else {
      return phone;
    }
  }

  public static checkOverDueHour(hour: string): boolean {
    return moment().isAfter(moment(hour, 'HH:mm:ss'));
  }

  public static strToArr(value) {
    if (_.indexOf(value, '|') === -1) return [value];

    const arr = value.split('|');

    return _.map(arr, (a) => parseInt(a));
  }

  public static convertToPercentage(data: number): string {
    return data === 0 ? data + '%' : data.toFixed(2) + '%';
  }

  public static getMediaUrlBaseOnType(type: MediaTypeEnum, url: string) {
    return type === MediaTypeEnum.UPLOAD ? removeHostAndQuery(url) : url;
  }

  public static rewardIntoEnumString(reward: Rewards){
          const {value, turnType} = reward
          const {value: turnTypeValue, name} = turnType
          let enumString = `${turnTypeValue}`
          if(value){
              enumString = Number(value) ?  `${turnTypeValue}_${value}` : `${turnTypeValue}`
          }
          const findObject = RewardMappingType.find(item => item.key === enumString)
          if(findObject){
              return findObject
          }
          return {
              key: enumString,
              text: `${name}`,
              type: 0
          }
      }

  public static addDashToKey(key: string) {
    return key.replace(
      /(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/,
      '$1-$2-$3-$4-$5',
    );
  }
}
