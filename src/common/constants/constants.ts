
export const AppConfig = {
  DB: 'DB_TWO',

  MICROSERVICE: {
    USER: 'QUEUE_USER',
    AUTH: 'QUEUE_AUTH',
    EMAIL: 'QUEUE_EMAIL',
    NOTICE: 'QUEUE_NOTICE',
  },
  HIDE_NO: [],
  IS_PUSHS: [],
  IS_SMS: [],
  AUTHORITY: ['Admin', 'User', 'Reviewer'],
  SMS: {
    SEND_OTP: 'This is the OTP code to login to the WNNR system: ',
  },
  MAX_RESEND_OTP: 5,
  RESEND_OTP_BEFORE: 24 * 60 * 60,
  SOCKET_ROOM_RAFFLE_PREFIX: 'RAFFLE-CHANNEL-',
  PHONE_CODE: '+91',
  NUMBER_OF_TURN: 10,
  CHART: {
    NUM_NODES: 7,
    RAFFLE_PARTICIPATION: {
      NUM_TOP: 5,
    },
    INTEREST_BY_CATEGORIES: {
      NUM_TOP: 5,
    },
    BLOCK_SESSION: 15 * 60, // Second
  },
};

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

// object with 31 element from 1-> 31
const daysOfMonths = [...Array(31)].reduce(
  (acc, _, i) => ({ ...acc, [i + 1]: true }),
  {},
);

export const monthsOfYear: { [key: string]: number } = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
} as const;

const weeklyDateValue = {
  Monday: true,
  Tuesday: true,
  Wednesday: true,
  Thursday: true,
  Friday: true,
};

export const halfYearMonthValue = {
  'Jan/Jul': 1,
  'Feb/Aug': 2,
  'Mar/Sep': 3,
  'Apr/Oct': 4,
  'May/Nov': 5,
  'Jun/Dec': 6,
} as const;

export const monthOfQuarter = { '1': true, '2': true, '3': true };


export enum DayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
}

export enum HandleLogicBy {
  QUEUE = 'QUEUE',
  DIRECT = 'DIRECT',
}

export enum ConvertPhoneNumAction {
  ADD_PHONE_CODE = 'ADD_PHONE_CODE',
  REMOVE_PHONE_CODE = 'REMOVE_PHONE_CODE',
}

export enum NotificationEvent {
  WELCOME_NEW_USER = 'WELCOME_NEW_USER',
  NEW_TICKET_ISSUED = 'NEW_TICKET_ISSUED',
  MILESTONE_COMPLETED = 'MILESTONE_COMPLETED',
  RAFFLE_WINNER = 'RAFFLE_WINNER',
  REFERRAL_WINNER = 'REFERRAL_WINNER',
  LOSER_AWARD = 'LOSER_AWARD',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  REFERRER_WINNER = 'REFERRER_WINNER',
  REFEREE_WINNER = 'REFEREE_WINNER',
}

export enum NotificationTopic {
  NEWS_LETTER = 'NEWS_LETTER',
}

export enum NotificationTopicAction {
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
}

export enum TagAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
}

export { ErrorCode } from './errors';
