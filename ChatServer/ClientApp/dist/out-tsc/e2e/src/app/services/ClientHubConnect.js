import * as signalR from '@aspnet/signalr';
import { ChatHub } from './app.service.signalR';
export class ClientHubConnect {
    static initialize() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('hub/clients', {
            accessTokenFactory: () => {
                return ChatHub.authorizationService.token;
            },
        })
            .build();
        this.connection.start().catch(err => console.error('Client hub start error:', err));
    }
    static Stop() {
        this.connection.stop();
    }
}
//# sourceMappingURL=ClientHubConnect.js.map