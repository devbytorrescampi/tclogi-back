import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VehiclePosition } from './vehicle-position.entity';

@WebSocketGateway({ namespace: 'tracking', cors: { origin: '*' } })
export class TrackingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Auth on the socket handshake is left for the frontend integration
    // step (token in handshake.auth), enforced once the frontend is wired up.
    void client;
  }

  @SubscribeMessage('subscribe:vehicle')
  subscribeToVehicle(client: Socket, vehicleId: string) {
    client.join(`vehicle:${vehicleId}`);
  }

  @SubscribeMessage('subscribe:route')
  subscribeToRoute(client: Socket, routeId: string) {
    client.join(`route:${routeId}`);
  }

  emitPositionUpdate(position: VehiclePosition) {
    this.server
      .to(`vehicle:${position.vehicleId}`)
      .emit('vehicle.position.updated', position);
  }
}
