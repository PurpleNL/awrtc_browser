import { ConnectionId, NetworkEvent } from "./index";
/**Helper to simulate the WebsocketNetwork or WebRtcNetwork
 * within a local application without
 * any actual network components.
 *
 * This implementation might lack some features.
 */
export declare class LocalNetwork {
    private static sNextId;
    private static mServers;
    private mId;
    private mNextNetworkId;
    private mServerAddress;
    private mEvents;
    private mConnectionNetwork;
    private mIsDisposed;
    constructor();
    readonly IsServer: boolean;
    StartServer(serverAddress?: string): void;
    StopServer(): void;
    Connect(address: string): ConnectionId;
    Shutdown(): void;
    Dispose(): void;
    SendData(userId: ConnectionId, data: Uint8Array, reliable: boolean): boolean;
    Update(): void;
    Dequeue(): NetworkEvent;
    Peek(): NetworkEvent;
    Flush(): void;
    Disconnect(id: ConnectionId): void;
    private FindConnectionId;
    private NextConnectionId;
    private ConnectClient;
    private Enqueue;
    private ReceiveData;
    private InternalDisconnect;
    private InternalDisconnectNetwork;
    private CleanupWreakReferences;
}
