export declare class MediaConfig {
    private mAudio;
    Audio: boolean | {
        [key: string]: any;
    };
    private mVideo;
    Video: boolean | {
        [key: string]: any;
    };
    readonly VideoHasConstraints: boolean;
    private mVideoDeviceId;
    VideoDeviceId: string;
    private mVideoDeviceName;
    VideoDeviceName: string;
    private mMinWidth;
    MinWidth: number;
    private mMinHeight;
    MinHeight: number;
    private mMaxWidth;
    MaxWidth: number;
    private mMaxHeight;
    MaxHeight: number;
    private mIdealWidth;
    IdealWidth: number;
    private mIdealHeight;
    IdealHeight: number;
    private mMinFps;
    MinFps: number;
    private mMaxFps;
    MaxFps: number;
    private mIdealFps;
    IdealFps: number;
    private mFrameUpdates;
    /** false - frame updates aren't generated. Useful for browser mode
     *  true  - library will deliver frames as ByteArray
    */
    FrameUpdates: boolean;
}
