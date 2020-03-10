import { WebRtcDataPeer } from "../network/index";
import { BrowserMediaStream } from "./BrowserMediaStream";
import { IFrameData } from "../media/RawFrame";
export interface RTCMediaStreamEvent extends Event {
    stream: MediaStream;
}
export interface RTCPeerConnectionObsolete extends RTCPeerConnection {
    onaddstream: ((this: RTCPeerConnection, streamEvent: RTCMediaStreamEvent) => any) | null;
    addStream(stream: MediaStream): void;
}
export declare class MediaPeer extends WebRtcDataPeer {
    private mRemoteStream;
    InternalStreamAdded: (peer: MediaPeer, stream: BrowserMediaStream) => void;
    static sUseObsolete: boolean;
    protected OnSetup(): void;
    protected OnCleanup(): void;
    private OnAddStream;
    private OnTrack;
    private SetupStream;
    TryGetRemoteFrame(): IFrameData;
    PeekFrame(): IFrameData;
    AddLocalStream(stream: MediaStream): void;
    Update(): void;
    SetVolume(volume: number): void;
    HasAudioTrack(): boolean;
    HasVideoTrack(): boolean;
}
