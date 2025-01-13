// validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { TokenUserInfo } from '../../../auth/dtos';
import { checkAdminRolePermission } from '../common/common.function';

enum MetaDataTypes {
  CUSTOM = 'custom',
  BODY = 'body',
}

@Injectable()
export class ValidateAdminRolePermissionPipe implements PipeTransform {
  private pipeValue = [];

  async transform(value: any, metadata: ArgumentMetadata) {
    this.pipeValue = [...this.pipeValue, { ...value, type: metadata?.type }];

    if (this.pipeValue.length === 2) {
      const bodyData = this.pipeValue.find(
        (v) => v.type === MetaDataTypes.BODY,
      );
      const userData = this.pipeValue.find(
        (v) => v.type === MetaDataTypes.CUSTOM,
      ) as TokenUserInfo;

      checkAdminRolePermission(bodyData, userData);
    }

    return value;
  }
}
