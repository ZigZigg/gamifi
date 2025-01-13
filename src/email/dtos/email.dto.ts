import { EmailData } from '../services/email.service';
import { EmailType } from '../../database/models/entities';
import { HandleLogicBy } from '../../common/constants/constants';

export class EmailDataDTO {
  payload: EmailData;
  type: EmailType;
  handleLogicBy?: HandleLogicBy;
}
