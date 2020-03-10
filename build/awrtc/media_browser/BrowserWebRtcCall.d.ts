import { AWebRtcCall } from "../media/AWebRtcCall";
import { NetworkConfig } from "../media/NetworkConfig";
/**Browser version of the C# version of WebRtcCall.
 *
 * See ICall interface for detailed documentation.
 * BrowserWebRtcCall mainly exists to allow other versions
 * in the future that might build on a different IMediaNetwork
 * interface (Maybe something running inside Webassembly?).
 */
export declare class BrowserWebRtcCall extends AWebRtcCall {
    constructor(config: NetworkConfig);
    private CreateNetwork;
    protected DisposeInternal(disposing: boolean): void;
}
