import { ICall } from "./ICall";
import { IMediaNetwork } from "./IMediaNetwork";
import { CallEventHandler } from "./CallEventArgs";
import { NetworkConfig } from "./NetworkConfig";
import { MediaConfig } from "./MediaConfig";
import { ConnectionId } from "../network/index";
declare enum CallState {
    Invalid = 0,
    Initialized = 1,
    Configuring = 2,
    Configured = 3,
    RequestingAddress = 4,
    WaitingForIncomingCall = 5,
    WaitingForOutgoingCall = 6,
    InCall = 7,
    Closed = 8
}
/**This class wraps an implementation of
 * IMediaStream and converts its polling system
 * to an easier to use event based system.
 *
 * Ideally use only features defined by
 * ICall to avoid having to deal with internal changes
 * in future updates.
 */
export declare class AWebRtcCall implements ICall {
    private MESSAGE_TYPE_INVALID;
    private MESSAGE_TYPE_DATA;
    private MESSAGE_TYPE_STRING;
    private MESSAGE_TYPE_CONTROL;
    protected mNetworkConfig: NetworkConfig;
    private mMediaConfig;
    private mCallEventHandlers;
    addEventListener(listener: CallEventHandler): void;
    removeEventListener(listener: CallEventHandler): void;
    protected mNetwork: IMediaNetwork;
    private mConnectionInfo;
    private mConferenceMode;
    private mState;
    readonly State: CallState;
    private mIsDisposed;
    private mServerInactive;
    private mPendingListenCall;
    private mPendingCallCall;
    private mPendingAddress;
    constructor(config?: NetworkConfig);
    protected Initialize(network: IMediaNetwork): void;
    Configure(config: MediaConfig): void;
    Call(address: string): void;
    Listen(address: string): void;
    Send(message: string, reliable?: boolean, id?: ConnectionId): void;
    private InternalSendToAll;
    private InternalSendTo;
    SendData(message: Uint8Array, reliable: boolean, id: ConnectionId): void;
    private PackStringMsg;
    private UnpackStringMsg;
    private PackDataMsg;
    private UnpackDataMsg;
    private InternalSendRawTo;
    Update(): void;
    private FrameToCallEvent;
    private MediaEventToCallEvent;
    private PendingCall;
    private ProcessCall;
    private PendingListen;
    private ProcessListen;
    private DoPending;
    private ClearPending;
    private CheckDisposed;
    private EnsureConfiguration;
    private TriggerCallEvent;
    private OnConfigurationComplete;
    private OnConfigurationFailed;
    protected DisposeInternal(disposing: boolean): void;
    Dispose(): void;
}
export {};
