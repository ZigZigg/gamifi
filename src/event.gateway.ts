import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { AppConfig } from './common/constants/constants';
import { EventGuard } from './auth/event.guard';
import * as dotenv from 'dotenv';

dotenv.config();

export enum EventName {
  SPIN_THE_PRIZE = 'SPIN_THE_PRIZE',
  RAFFLE_CANCELLED = 'RAFFLE_CANCELLED',
}

@WebSocketGateway({ cors: true, namespace: 'events' })
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventGateway');
  clients: { [k: string]: any } = {};

  @UseGuards(EventGuard)
  @SubscribeMessage('joinRaffle')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody('raffleId') raffleId: number,
  ) {
    const room = AppConfig.SOCKET_ROOM_RAFFLE_PREFIX + raffleId;
    client.join(room);
    this.clients[client.id] = { room };

    this.logger.log(`✔✔✔ Client "${client.id}" join the room "${room}"`);
  }

  @UseGuards(EventGuard)
  @SubscribeMessage('leftRaffle')
  handleLeft(
    @ConnectedSocket() client: Socket,
    @MessageBody('raffleId') raffleId: number,
  ) {
    const room = AppConfig.SOCKET_ROOM_RAFFLE_PREFIX + raffleId;
    client.leave(room);
    delete this.clients[client.id];

    this.logger.log(`✗✗✗ Client "${client.id}" left the room "${room}"`);
  }

  afterInit() {
    this.logger.log('☆☆☆☆☆ START SOCKET ☆☆☆☆☆');
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.clients[client.id];

    if (clientInfo && clientInfo.room) {
      client.leave(clientInfo.room);
      delete this.clients[client.id];
    }

    this.logger.log(`⇦⇦⇦ Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`⇨⇨⇨ Client connected: ${client.id}`);
  }

  emitEvent(room: string, event: EventName, payload: any) {
    this.server.to(room).emit(event, payload);
    this.logger.log(`➽➽➽ Send to room "${room}" with event "${event}"`);
  }
}
