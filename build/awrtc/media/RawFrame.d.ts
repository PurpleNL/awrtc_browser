import { BrowserMediaStream } from "../media_browser/index";
export declare enum FramePixelFormat {
    Invalid = 0,
    Format32bppargb = 1
}
export declare class IFrameData {
    readonly Format: FramePixelFormat;
    readonly Buffer: Uint8Array;
    readonly Width: number;
    readonly Height: number;
    constructor();
}
export declare class RawFrame extends IFrameData {
    private mBuffer;
    readonly Buffer: Uint8Array;
    private mWidth;
    readonly Width: number;
    private mHeight;
    readonly Height: number;
    constructor(buffer: Uint8Array, width: number, height: number);
}
/**
 * This class is suppose to increase the speed of the java script implementation.
 * Instead of creating RawFrames every Update call (because the real fps are unknown currently) it will
 * only create a lazy frame which will delay the creation of the RawFrame until the user actually tries
 * to access any data.
 * Thus if the game slows down or the user doesn't access any data the expensive copy is avoided.
 */
export declare class LazyFrame extends IFrameData {
    private mFrameGenerator;
    readonly FrameGenerator: BrowserMediaStream;
    private mRawFrame;
    readonly Buffer: Uint8Array;
    readonly Width: number;
    readonly Height: number;
    constructor(frameGenerator: BrowserMediaStream);
    private GenerateFrame;
}
