import { ApiError } from '../classes/api-error';
import * as moment from 'moment';
import { ErrorCode } from '../constants/constants';


export function validateRaffleStartTime(startTime: string) {
  if (startTime) {
    const currentTime = moment();
    const startDateTime = moment(startTime);

    if (!startDateTime.isValid()) {
      throw new ApiError(ErrorCode.INVALID_START_TIME_FORMAT);
    }

    if (startDateTime.isBefore(currentTime)) {
      throw new ApiError(ErrorCode.START_TIME_SMALLER_THAN_CURRENT_TIME);
    }
  }

  return true;
}
