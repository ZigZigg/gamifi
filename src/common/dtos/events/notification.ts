import { NotificationEvent } from '../../../common/constants/constants';

export class TriggerWorkflowEvent {
  constructor(
    public readonly event: NotificationEvent,
    public readonly subscriberIds: string[],
    public readonly payload: unknown,
  ) {}
}

export class SubscriberUpdatedEvent {
  constructor(
    public readonly subscriberId: string,
    public readonly payload: { [k: string]: string | { [k: string]: unknown } },
  ) {}
}
