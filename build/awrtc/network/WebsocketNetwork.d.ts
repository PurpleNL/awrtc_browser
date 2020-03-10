import { ConnectionId, NetworkEvent, IBasicNetwork } from './INetwork';
export declare enum WebsocketConnectionStatus {
    Uninitialized = 0,
    NotConnected = 1,
    Connecting = 2,
    Connected = 3,
    Disconnecting = 4
}
export declare enum WebsocketServerStatus {
    Offline = 0,
    Starting = 1,
    Online = 2,
    ShuttingDown = 3
}
export declare class WebsocketNetwork implements IBasicNetwork {
    private mSocket;
    private mStatus;
    getStatus(): WebsocketConnectionStatus;
    private mOutgoingQueue;
    private mIncomingQueue;
    private mServerStatus;
    private mConnecting;
    private mConnections;
    private mNextOutgoingConnectionId;
    private mUrl;
    private mIsDisposed;
    constructor(url: string);
    private WebsocketConnect;
    private WebsocketCleanup;
    private EnsureServerConnection;
    private CheckSleep;
    private OnWebsocketOnOpen;
    private OnWebsocketOnClose;
    private OnWebsocketOnMessage;
    private OnWebsocketOnError;
    private Cleanup;
    private EnqueueOutgoing;
    private EnqueueIncoming;
    private TryRemoveConnecting;
    private TryRemoveConnection;
    private HandleIncomingEvent;
    private HandleOutgoingEvents;
    private NextConnectionId;
    private GetRandomKey;
    Dequeue(): NetworkEvent;
    Peek(): NetworkEvent;
    Update(): void;
    Flush(): void;
    SendData(id: ConnectionId, data: Uint8Array, /*offset: number, length: number,*/ reliable: boolean): boolean;
    Disconnect(id: ConnectionId): void;
    Shutdown(): void;
    Dispose(): void;
    StartServer(): void;
    StartServer(address: string): void;
    StopServer(): void;
    Connect(address: string): ConnectionId;
}
