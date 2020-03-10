import { SignalingConfig, WebRtcDataPeer, NetworkEvent, ConnectionId, IBasicNetwork } from "./index";
export declare enum WebRtcNetworkServerState {
    Invalid = 0,
    Offline = 1,
    Starting = 2,
    Online = 3
}
export declare class WebRtcNetwork implements IBasicNetwork {
    private mTimeout;
    private mInSignaling;
    private mNextId;
    private mSignaling;
    private mEvents;
    private mIdToConnection;
    protected readonly IdToConnection: {
        [id: number]: WebRtcDataPeer;
    };
    private mConnectionIds;
    GetConnections(): Array<ConnectionId>;
    private mServerState;
    private mRtcConfig;
    private mSignalingNetwork;
    private mLogDelegate;
    private mIsDisposed;
    SetLog(logDel: (s: string) => void): void;
    constructor(signalingConfig: SignalingConfig, lRtcConfig: RTCConfiguration);
    StartServer(): void;
    StartServer(address: string): void;
    protected StartServerInternal(address?: string): void;
    StopServer(): void;
    Connect(address: string): ConnectionId;
    Update(): void;
    Dequeue(): NetworkEvent;
    Peek(): NetworkEvent;
    Flush(): void;
    SendData(id: ConnectionId, data: Uint8Array, reliable: boolean): boolean;
    Disconnect(id: ConnectionId): void;
    Shutdown(): void;
    protected DisposeInternal(): void;
    Dispose(): void;
    protected CreatePeer(peerId: ConnectionId, rtcConfig: RTCConfiguration): WebRtcDataPeer;
    private CheckSignalingState;
    private UpdateSignalingNetwork;
    private UpdatePeers;
    private AddOutgoingConnection;
    private AddIncomingConnection;
    private ConnectionEstablished;
    private SignalingFailed;
    private HandleDisconnect;
    private NextConnectionId;
    private StringToBuffer;
    private BufferToString;
}
