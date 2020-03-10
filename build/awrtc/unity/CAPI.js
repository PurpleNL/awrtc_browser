/*
Copyright (c) 2019, because-why-not.com Limited
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/**This file contains the mapping between the awrtc_browser library and
 * Unitys WebGL support. Not needed for regular use.
 */
import { SLog, WebRtcNetwork, SignalingConfig, ConnectionId, LocalNetwork, WebsocketNetwork } from "../network/index";
import { NetworkConfig, MediaConfig } from "../media/index";
import { BrowserMediaNetwork, DeviceApi } from "../media_browser/index";
var gCAPIWebRtcNetworkInstances = {};
var gCAPIWebRtcNetworkInstancesNextIndex = 1;
export function CAPIWebRtcNetworkIsAvailable() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        return true;
    SLog.LE("Browser doesn't seem to support a modern WebRTC API");
    return false;
}
export function CAPIWebRtcNetworkCreate(lConfiguration) {
    var lIndex = gCAPIWebRtcNetworkInstancesNextIndex;
    gCAPIWebRtcNetworkInstancesNextIndex++;
    var signaling_class = "LocalNetwork";
    var signaling_param = null;
    var iceServers;
    if (lConfiguration == null || typeof lConfiguration !== 'string' || lConfiguration.length === 0) {
        SLog.LogError("invalid configuration. Returning -1! Config: " + lConfiguration);
        return -1;
    }
    else {
        var conf = JSON.parse(lConfiguration);
        if (conf) {
            if (conf.signaling) {
                signaling_class = conf.signaling.class;
                signaling_param = conf.signaling.param;
            }
            if (conf.iceServers) {
                iceServers = conf.iceServers;
            }
            SLog.L(signaling_class);
            //this seems to be broken after switch to modules
            //let signalingNetworkClass = window[signaling_class];
            //let signalingNetworkClass =  new (<any>window)["awrtc.LocalNetwork"];
            //console.debug(signalingNetworkClass);
            var signalingNetworkClass = void 0;
            if (signaling_class === "LocalNetwork") {
                signalingNetworkClass = LocalNetwork;
            }
            else {
                signalingNetworkClass = WebsocketNetwork;
            }
            var signalingConfig = new SignalingConfig(new signalingNetworkClass(signaling_param));
            var rtcConfiguration = { iceServers: iceServers };
            gCAPIWebRtcNetworkInstances[lIndex] = new WebRtcNetwork(signalingConfig, rtcConfiguration);
        }
        else {
            SLog.LogWarning("Parsing configuration failed. Configuration: " + lConfiguration);
            return -1;
        }
    }
    //gCAPIWebRtcNetworkInstances[lIndex].OnLog = function (lMsg) {
    //    console.debug(lMsg);
    //};
    return lIndex;
}
export function CAPIWebRtcNetworkRelease(lIndex) {
    if (lIndex in gCAPIWebRtcNetworkInstances) {
        gCAPIWebRtcNetworkInstances[lIndex].Dispose();
        delete gCAPIWebRtcNetworkInstances[lIndex];
    }
}
export function CAPIWebRtcNetworkConnect(lIndex, lRoom) {
    return gCAPIWebRtcNetworkInstances[lIndex].Connect(lRoom);
}
export function CAPIWebRtcNetworkStartServer(lIndex, lRoom) {
    gCAPIWebRtcNetworkInstances[lIndex].StartServer(lRoom);
}
export function CAPIWebRtcNetworkStopServer(lIndex) {
    gCAPIWebRtcNetworkInstances[lIndex].StopServer();
}
export function CAPIWebRtcNetworkDisconnect(lIndex, lConnectionId) {
    gCAPIWebRtcNetworkInstances[lIndex].Disconnect(new ConnectionId(lConnectionId));
}
export function CAPIWebRtcNetworkShutdown(lIndex) {
    gCAPIWebRtcNetworkInstances[lIndex].Shutdown();
}
export function CAPIWebRtcNetworkUpdate(lIndex) {
    gCAPIWebRtcNetworkInstances[lIndex].Update();
}
export function CAPIWebRtcNetworkFlush(lIndex) {
    gCAPIWebRtcNetworkInstances[lIndex].Flush();
}
export function CAPIWebRtcNetworkSendData(lIndex, lConnectionId, lUint8ArrayData, lReliable) {
    gCAPIWebRtcNetworkInstances[lIndex].SendData(new ConnectionId(lConnectionId), lUint8ArrayData, lReliable);
}
//helper for emscripten
export function CAPIWebRtcNetworkSendDataEm(lIndex, lConnectionId, lUint8ArrayData, lUint8ArrayDataOffset, lUint8ArrayDataLength, lReliable) {
    //console.debug("SendDataEm: " + lReliable + " length " + lUint8ArrayDataLength + " to " + lConnectionId);
    var arrayBuffer = new Uint8Array(lUint8ArrayData.buffer, lUint8ArrayDataOffset, lUint8ArrayDataLength);
    return gCAPIWebRtcNetworkInstances[lIndex].SendData(new ConnectionId(lConnectionId), arrayBuffer, lReliable);
}
export function CAPIWebRtcNetworkDequeue(lIndex) {
    return gCAPIWebRtcNetworkInstances[lIndex].Dequeue();
}
export function CAPIWebRtcNetworkPeek(lIndex) {
    return gCAPIWebRtcNetworkInstances[lIndex].Peek();
}
/**Allows to peek into the next event to figure out its length and allocate
 * the memory needed to store it before calling
 *      CAPIWebRtcNetworkDequeueEm
 *
 * @param {type} lIndex
 * @returns {Number}
 */
export function CAPIWebRtcNetworkPeekEventDataLength(lIndex) {
    var lNetEvent = gCAPIWebRtcNetworkInstances[lIndex].Peek();
    return CAPIWebRtcNetworkCheckEventLength(lNetEvent);
}
//helper
export function CAPIWebRtcNetworkCheckEventLength(lNetEvent) {
    if (lNetEvent == null) {
        //invalid event
        return -1;
    }
    else if (lNetEvent.RawData == null) {
        //no data
        return 0;
    }
    else if (typeof lNetEvent.RawData === "string") {
        //no user strings are allowed thus we get away with counting the characters
        //(ASCII only!)
        return lNetEvent.RawData.length;
    }
    else //message event types 1 and 2 only? check for it?
     {
        //its not null and not a string. can only be a Uint8Array if we didn't
        //mess something up in the implementation
        return lNetEvent.RawData.length;
    }
}
export function CAPIWebRtcNetworkEventDataToUint8Array(data, dataUint8Array, dataOffset, dataLength) {
    //data can be null, string or Uint8Array
    //return value will be the length of data we used
    if (data == null) {
        return 0;
    }
    else if ((typeof data) === "string") {
        //in case we don't get a large enough array we need to cut off the string
        var i = 0;
        for (i = 0; i < data.length && i < dataLength; i++) {
            dataUint8Array[dataOffset + i] = data.charCodeAt(i);
        }
        return i;
    }
    else {
        var i = 0;
        //in case we don't get a large enough array we need to cut off the string
        for (i = 0; i < data.length && i < dataLength; i++) {
            dataUint8Array[dataOffset + i] = data[i];
        }
        return i;
    }
}
//Version for emscripten or anything that doesn't have a garbage collector.
// The memory for everything needs to be allocated before the call.
export function CAPIWebRtcNetworkDequeueEm(lIndex, lTypeIntArray, lTypeIntIndex, lConidIntArray, lConidIndex, lDataUint8Array, lDataOffset, lDataLength, lDataLenIntArray, lDataLenIntIndex) {
    var nEvt = CAPIWebRtcNetworkDequeue(lIndex);
    if (nEvt == null)
        return false;
    lTypeIntArray[lTypeIntIndex] = nEvt.Type;
    lConidIntArray[lConidIndex] = nEvt.ConnectionId.id;
    //console.debug("event" + nEvt.netEventType);
    var length = CAPIWebRtcNetworkEventDataToUint8Array(nEvt.RawData, lDataUint8Array, lDataOffset, lDataLength);
    lDataLenIntArray[lDataLenIntIndex] = length; //return the length if so the user knows how much of the given array is used
    return true;
}
export function CAPIWebRtcNetworkPeekEm(lIndex, lTypeIntArray, lTypeIntIndex, lConidIntArray, lConidIndex, lDataUint8Array, lDataOffset, lDataLength, lDataLenIntArray, lDataLenIntIndex) {
    var nEvt = CAPIWebRtcNetworkPeek(lIndex);
    if (nEvt == null)
        return false;
    lTypeIntArray[lTypeIntIndex] = nEvt.Type;
    lConidIntArray[lConidIndex] = nEvt.ConnectionId.id;
    //console.debug("event" + nEvt.netEventType);
    var length = CAPIWebRtcNetworkEventDataToUint8Array(nEvt.RawData, lDataUint8Array, lDataOffset, lDataLength);
    lDataLenIntArray[lDataLenIntIndex] = length; //return the length if so the user knows how much of the given array is used
    return true;
}
export function CAPIMediaNetwork_IsAvailable() {
    return true;
}
export function CAPIMediaNetwork_Create(lJsonConfiguration) {
    var config = new NetworkConfig();
    config = JSON.parse(lJsonConfiguration);
    var mediaNetwork = new BrowserMediaNetwork(config);
    var lIndex = gCAPIWebRtcNetworkInstancesNextIndex;
    gCAPIWebRtcNetworkInstancesNextIndex++;
    gCAPIWebRtcNetworkInstances[lIndex] = mediaNetwork;
    return lIndex;
}
//Configure(config: MediaConfig): void;
export function CAPIMediaNetwork_Configure(lIndex, audio, video, minWidth, minHeight, maxWidth, maxHeight, idealWidth, idealHeight, minFps, maxFps, idealFps, deviceName) {
    if (deviceName === void 0) { deviceName = ""; }
    var config = new MediaConfig();
    config.Audio = audio;
    config.Video = video;
    config.MinWidth = minWidth;
    config.MinHeight = minHeight;
    config.MaxWidth = maxWidth;
    config.MaxHeight = maxHeight;
    config.IdealWidth = idealWidth;
    config.IdealHeight = idealHeight;
    config.MinFps = minFps;
    config.MaxFps = maxFps;
    config.IdealFps = idealFps;
    config.VideoDeviceName = deviceName;
    config.FrameUpdates = true;
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    mediaNetwork.Configure(config);
}
//GetConfigurationState(): MediaConfigurationState;
export function CAPIMediaNetwork_GetConfigurationState(lIndex) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    return mediaNetwork.GetConfigurationState();
}
//Note: not yet glued to the C# version!
//GetConfigurationError(): string;
export function CAPIMediaNetwork_GetConfigurationError(lIndex) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    return mediaNetwork.GetConfigurationError();
}
//ResetConfiguration(): void;
export function CAPIMediaNetwork_ResetConfiguration(lIndex) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    return mediaNetwork.ResetConfiguration();
}
//TryGetFrame(id: ConnectionId): RawFrame;
export function CAPIMediaNetwork_TryGetFrame(lIndex, lConnectionId, lWidthInt32Array, lWidthIntArrayIndex, lHeightInt32Array, lHeightIntArrayIndex, lBufferUint8Array, lBufferUint8ArrayOffset, lBufferUint8ArrayLength) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    var frame = mediaNetwork.TryGetFrame(new ConnectionId(lConnectionId));
    if (frame == null || frame.Buffer == null) {
        return false;
    }
    else {
        //TODO: copy frame over
        lWidthInt32Array[lWidthIntArrayIndex] = frame.Width;
        lHeightInt32Array[lHeightIntArrayIndex] = frame.Height;
        for (var i = 0; i < lBufferUint8ArrayLength && i < frame.Buffer.length; i++) {
            lBufferUint8Array[lBufferUint8ArrayOffset + i] = frame.Buffer[i];
        }
        return true;
    }
}
//Returns the frame buffer size or -1 if no frame is available
export function CAPIMediaNetwork_TryGetFrameDataLength(lIndex, connectionId) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    var frame = mediaNetwork.PeekFrame(new ConnectionId(connectionId));
    var length = -1;
    //added frame.Buffer != null as the frame might be a LazyFrame just creating a copy of the html video element
    //in the moment frame.Buffer is called. if this fails for any reasion it might return null despite
    //the frame object itself being available
    if (frame != null && frame.Buffer != null) {
        length = frame.Buffer.length;
    }
    //SLog.L("data length:" + length);
    return length;
}
export function CAPIMediaNetwork_SetVolume(lIndex, volume, connectionId) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    mediaNetwork.SetVolume(volume, new ConnectionId(connectionId));
}
export function CAPIMediaNetwork_HasAudioTrack(lIndex, connectionId) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    return mediaNetwork.HasAudioTrack(new ConnectionId(connectionId));
}
export function CAPIMediaNetwork_HasVideoTrack(lIndex, connectionId) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    return mediaNetwork.HasVideoTrack(new ConnectionId(connectionId));
}
export function CAPIMediaNetwork_SetMute(lIndex, value) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    mediaNetwork.SetMute(value);
}
export function CAPIMediaNetwork_IsMute(lIndex) {
    var mediaNetwork = gCAPIWebRtcNetworkInstances[lIndex];
    return mediaNetwork.IsMute();
}
export function CAPI_DeviceApi_Update() {
    DeviceApi.Update();
}
export function CAPI_DeviceApi_RequestUpdate() {
    DeviceApi.RequestUpdate();
}
export function CAPI_DeviceApi_LastUpdate() {
    return DeviceApi.LastUpdate;
}
export function CAPI_DeviceApi_Devices_Length() {
    return Object.keys(DeviceApi.Devices).length;
}
export function CAPI_DeviceApi_Devices_Get(index) {
    var keys = Object.keys(DeviceApi.Devices);
    if (keys.length > index) {
        var key = keys[index];
        return DeviceApi.Devices[key].label;
    }
    else {
        SLog.LE("Requested device with index " + index + " does not exist.");
        return "";
    }
}
/**
 *
 * @param loglevel
 * None = 0,
 * Errors = 1,
 * Warnings = 2,
 * Verbose = 3
 */
export function CAPI_SLog_SetLogLevel(loglevel) {
    if (loglevel < 0 || loglevel > 3) {
        SLog.LogError("Invalid log level " + loglevel);
        return;
    }
    SLog.SetLogLevel(loglevel);
}
//# sourceMappingURL=CAPI.js.map