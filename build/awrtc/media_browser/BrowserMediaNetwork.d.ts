import { WebRtcNetwork, ConnectionId, WebRtcDataPeer } from "../network/index";
import { IMediaNetwork, MediaConfigurationState, MediaEvent } from "../media/IMediaNetwork";
import { NetworkConfig } from "../media/NetworkConfig";
import { MediaConfig } from "../media/MediaConfig";
import { IFrameData } from "../media/RawFrame";
/**Avoid using this class directly whenever possible. Use BrowserWebRtcCall instead.
 * BrowserMediaNetwork might be subject to frequent changes to keep up with changes
 * in all other platforms.
 *
 * IMediaNetwork implementation for the browser. The class is mostly identical with the
 * C# version. Main goal is to have an interface that can easily be wrapped to other
 * programming languages and gives access to basic WebRTC features such as receiving
 * and sending audio and video + signaling via websockets.
 *
 * BrowserMediaNetwork can be used to stream a local audio and video track to a group of
 * multiple peers and receive remote tracks. The handling of the peers itself
 * remains the same as WebRtcNetwork.
 * Local tracks are created after calling Configure. This will request access from the
 * user. After the user allowed access GetConfigurationState will return Configured.
 * Every incoming and outgoing peer that is established after this will receive
 * the local audio and video track.
 * So far Configure can only be called once before any peers are connected.
 *
 *
 */
export declare class BrowserMediaNetwork extends WebRtcNetwork implements IMediaNetwork {
    private mMediaConfig;
    private mLocalStream;
    private mConfigurationState;
    private mConfigurationError;
    private mMediaEvents;
    constructor(config: NetworkConfig);
    /**Triggers the creation of a local audio and video track. After this
     * call the user might get a request to allow access to the requested
     * devices.
     *
     * @param config Detail configuration for audio/video devices.
     */
    Configure(config: MediaConfig): void;
    /**Call this every time a new frame is shown to the user in realtime
     * applications.
     *
     */
    Update(): void;
    private EnqueueMediaEvent;
    DequeueMediaEvent(): MediaEvent;
    /**
     * Call this every frame after interacting with this instance.
     *
     * This call might flush buffered messages in the future and clear
     * events that the user didn't process to avoid buffer overflows.
     *
     */
    Flush(): void;
    /**Poll this after Configure is called to get the result.
     * Won't change after state is Configured or Failed.
     *
     */
    GetConfigurationState(): MediaConfigurationState;
    /**Returns the error message if the configure process failed.
     * This usally either happens because the user refused access
     * or no device fulfills the configuration given
     * (e.g. device doesn't support the given resolution)
     *
     */
    GetConfigurationError(): string;
    /**Resets the configuration state to allow multiple attempts
     * to call Configure.
     *
     */
    ResetConfiguration(): void;
    private OnConfigurationSuccess;
    private OnConfigurationFailed;
    /**Allows to peek at the current frame.
     * Added to allow the emscripten C / C# side to allocate memory before
     * actually getting the frame.
     *
     * @param id
     */
    PeekFrame(id: ConnectionId): IFrameData;
    TryGetFrame(id: ConnectionId): IFrameData;
    /**
     * Remote audio control for each peer.
     *
     * @param volume 0 - mute and 1 - max volume
     * @param id peer id
     */
    SetVolume(volume: number, id: ConnectionId): void;
    /** Allows to check if a specific peer has a remote
     * audio track attached.
     *
     * @param id
     */
    HasAudioTrack(id: ConnectionId): boolean;
    /** Allows to check if a specific peer has a remote
     * video track attached.
     *
     * @param id
     */
    HasVideoTrack(id: ConnectionId): boolean;
    /**Returns true if no local audio available or it is muted.
     * False if audio is available (could still not work due to 0 volume, hardware
     * volume control or a dummy audio input device is being used)
     */
    IsMute(): boolean;
    /**Sets the local audio device to mute / unmute it.
     *
     * @param value
     */
    SetMute(value: boolean): void;
    protected CreatePeer(peerId: ConnectionId, lRtcConfig: RTCConfiguration): WebRtcDataPeer;
    private MediaPeer_InternalMediaStreamAdded;
    protected DisposeInternal(): void;
    private DisposeLocalStream;
    private static BuildSignalingConfig;
    private static BuildRtcConfig;
}
