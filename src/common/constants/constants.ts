import { text } from 'stream/consumers';
const oneHour = 60 * 60;

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
  REDIS_TTL: oneHour * 24
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

export const RewardMappingType = [
  {
    key: 'PHONE_CARD_5000',
    text: 'Nạp 5000',
    type: 1
  },
  {
    key: 'MP_SCORE_68',
    text: '68 điểm MyPoint',
    type: 2
  },
  {
    key: 'MP_SCORE_686',
    text: '686 điểm MyPoint',
    type: 3
  },
  {
    key: 'MP_SCORE_6868',
    text: '6868 điểm MyPoint',
    type: 4
  },
  {
    key: 'AIRPOD_PIECE_1',
    text: 'icon mảnh ghép AirPods (1)',
    type: 5
  },
  {
    key: 'AIRPOD_PIECE_2',
    text: 'icon mảnh ghép AirPods (2)',
    type: 6
  },
  {
    key: 'IP_PIECE_1',
    text: 'icon mảnh ghép iPhone (1)',
    type: 7
  },
  {
    key: 'VOUCHER_MP',
    text: 'Voucher MyPoint',
    type: 8
  },
  {
    key: 'PHONE_CARD_50000',
    text: 'Nạp 50000',
    type: 9
  },
  {
    key: 'PHONE_CARD_100000',
    text: 'Nạp 100000',
    type: 10
  },
  {
    key: 'MP_SCORE_68680',
    text: '68680 điểm MyPoint',
    type: 11
  },
  {
    key: 'PHONE_CARD_200000',
    text: 'Nạp 200000',
    type: 12
  },
  {
    key: 'IP_PIECE_2',
    text: 'icon mảnh ghép iPhone (2)',
    type: 13
  },
  {
    key: 'PHONE_CARD_500000',
    text: 'Nạp 500000',
    type: 14
  },
  {
    key: 'MP_SCORE_686868',
    text: '686868 điểm MyPoint',
    type: 15
  },
  {
    key: 'IP_PIECE_3',
    text: 'icon mảnh ghép iPhone (3)',
    type: 16
  },
  {
    key: 'AIRPOD_PIECE_3',
    text: 'icon mảnh ghép AirPods (3)',
    type: 17
  },
  {
    key: 'GOOD_LUCK',
    text: 'Chúc bạn may mắn lần sau',
    type: 18
  },
]

export const ConditionTurnType = {
  FREE: [1],
  PAID: [2]
}

export const TurnTypeMapping = {
  1: 1,
  3: 1,
  13: 1,
  5: 1,
  6: 2,
  18: 2
}

export const FullCraftReward = [
  {
    craftString: 'AIRPOD_PIECE_1_AIRPOD_PIECE_2_AIRPOD_PIECE_3',
    type: 'AIRPOD_DEVICE',
  },
  {
    craftString: 'IP_PIECE_1_IP_PIECE_2_IP_PIECE_3',
    type: 'IPHONE_DEVICE',
  },
]

export const REDIS_KEY = {
  MASTER_DATA_LIST: 'MASTER_DATA_LIST',
  REWARD_CURRENT_STOCK_LIST: 'REWARD_CURRENT_STOCK_LIST',
}