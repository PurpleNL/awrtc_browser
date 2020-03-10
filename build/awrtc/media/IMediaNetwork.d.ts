import { ConnectionId, IWebRtcNetwork } from "../network/index";
import { MediaConfig } from "./MediaConfig";
import { IFrameData } from "./RawFrame";
export declare enum MediaConfigurationState {
    Invalid = 0,
    NoConfiguration = 1,
    InProgress = 2,
    Successful = 3,
    Failed = 4
}
export declare enum MediaEventType {
    Invalid = 0,
    StreamAdded = 20
}
/**
 * Will replace frame event / configuration system in the future.
 *
 * So far it only delivers HTMLVideoElements once connection and
 * all tracks are ready and it plays.
 *
 * This is all temporary and will be updated soon to handle
 * all events from configuration of local streams to frame updates and
 * renegotation.
 *
 */
export declare class MediaEvent {
    private mEventType;
    readonly EventType: MediaEventType;
    private mConnectionId;
    readonly ConnectionId: ConnectionId;
    private mArgs;
    readonly Args: any;
    constructor(type: MediaEventType, id: ConnectionId, args: any);
}
/**Interface adds media functionality to IWebRtcNetwork.
 * It is used to ensure compatibility to all other platforms.
 */
export interface IMediaNetwork extends IWebRtcNetwork {
    Configure(config: MediaConfig): void;
    GetConfigurationState(): MediaConfigurationState;
    GetConfigurationError(): string;
    ResetConfiguration(): void;
    TryGetFrame(id: ConnectionId): IFrameData;
    PeekFrame(id: ConnectionId): IFrameData;
    SetVolume(volume: number, id: ConnectionId): void;
    HasAudioTrack(id: ConnectionId): boolean;
    HasVideoTrack(id: ConnectionId): boolean;
    DequeueMediaEvent(): MediaEvent;
}
