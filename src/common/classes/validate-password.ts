import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ErrorCode } from '../constants/errors';
import { ApiError } from './api-error';

@ValidatorConstraint({ name: 'ValidatePasswordFormat' })
export class ValidatePasswordFormat implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: string) {
    try {
      if (value.length < 8 || value.length > 256) {
        throw Error();
      }

      // Check if password contains at least one uppercase letter, one lowercase letter, one number, and one special character
      const uppercaseRegex = /[A-Z]/;
      const lowercaseRegex = /[a-z]/;
      const numberRegex = /[0-9]/;
      const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

      if (
        !uppercaseRegex.test(value) ||
        !lowercaseRegex.test(value) ||
        !numberRegex.test(value) ||
        !specialCharRegex.test(value)
      ) {
        throw Error();
      }

      // Password meets all criteria
      return true;
    } catch (e) {
      throw new ApiError(ErrorCode.INVALID_PASSWORD_FORMAT);
    }
  }

  defaultMessage() {
    return ErrorCode.INVALID_PASSWORD_FORMAT;
  }
}
