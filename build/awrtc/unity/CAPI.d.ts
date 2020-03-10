/**This file contains the mapping between the awrtc_browser library and
 * Unitys WebGL support. Not needed for regular use.
 */
import { NetworkEvent, ConnectionId } from "../network/index";
export declare function CAPIWebRtcNetworkIsAvailable(): boolean;
export declare function CAPIWebRtcNetworkCreate(lConfiguration: string): number;
export declare function CAPIWebRtcNetworkRelease(lIndex: number): void;
export declare function CAPIWebRtcNetworkConnect(lIndex: number, lRoom: string): ConnectionId;
export declare function CAPIWebRtcNetworkStartServer(lIndex: number, lRoom: string): void;
export declare function CAPIWebRtcNetworkStopServer(lIndex: number): void;
export declare function CAPIWebRtcNetworkDisconnect(lIndex: number, lConnectionId: number): void;
export declare function CAPIWebRtcNetworkShutdown(lIndex: number): void;
export declare function CAPIWebRtcNetworkUpdate(lIndex: number): void;
export declare function CAPIWebRtcNetworkFlush(lIndex: number): void;
export declare function CAPIWebRtcNetworkSendData(lIndex: number, lConnectionId: number, lUint8ArrayData: Uint8Array, lReliable: boolean): void;
export declare function CAPIWebRtcNetworkSendDataEm(lIndex: number, lConnectionId: number, lUint8ArrayData: Uint8Array, lUint8ArrayDataOffset: number, lUint8ArrayDataLength: number, lReliable: boolean): boolean;
export declare function CAPIWebRtcNetworkDequeue(lIndex: number): NetworkEvent;
export declare function CAPIWebRtcNetworkPeek(lIndex: number): NetworkEvent;
/**Allows to peek into the next event to figure out its length and allocate
 * the memory needed to store it before calling
 *      CAPIWebRtcNetworkDequeueEm
 *
 * @param {type} lIndex
 * @returns {Number}
 */
export declare function CAPIWebRtcNetworkPeekEventDataLength(lIndex: any): any;
export declare function CAPIWebRtcNetworkCheckEventLength(lNetEvent: NetworkEvent): any;
export declare function CAPIWebRtcNetworkEventDataToUint8Array(data: any, dataUint8Array: Uint8Array, dataOffset: number, dataLength: number): number;
export declare function CAPIWebRtcNetworkDequeueEm(lIndex: number, lTypeIntArray: Int32Array, lTypeIntIndex: number, lConidIntArray: Int32Array, lConidIndex: number, lDataUint8Array: Uint8Array, lDataOffset: number, lDataLength: number, lDataLenIntArray: Int32Array, lDataLenIntIndex: number): boolean;
export declare function CAPIWebRtcNetworkPeekEm(lIndex: number, lTypeIntArray: Int32Array, lTypeIntIndex: number, lConidIntArray: Int32Array, lConidIndex: number, lDataUint8Array: Uint8Array, lDataOffset: number, lDataLength: number, lDataLenIntArray: Int32Array, lDataLenIntIndex: number): boolean;
export declare function CAPIMediaNetwork_IsAvailable(): boolean;
export declare function CAPIMediaNetwork_Create(lJsonConfiguration: any): number;
export declare function CAPIMediaNetwork_Configure(lIndex: number, audio: boolean, video: boolean, minWidth: number, minHeight: number, maxWidth: number, maxHeight: number, idealWidth: number, idealHeight: number, minFps: number, maxFps: number, idealFps: number, deviceName?: string): void;
export declare function CAPIMediaNetwork_GetConfigurationState(lIndex: number): number;
export declare function CAPIMediaNetwork_GetConfigurationError(lIndex: number): string;
export declare function CAPIMediaNetwork_ResetConfiguration(lIndex: number): void;
export declare function CAPIMediaNetwork_TryGetFrame(lIndex: number, lConnectionId: number, lWidthInt32Array: Int32Array, lWidthIntArrayIndex: number, lHeightInt32Array: Int32Array, lHeightIntArrayIndex: number, lBufferUint8Array: Uint8Array, lBufferUint8ArrayOffset: number, lBufferUint8ArrayLength: number): boolean;
export declare function CAPIMediaNetwork_TryGetFrameDataLength(lIndex: number, connectionId: number): number;
export declare function CAPIMediaNetwork_SetVolume(lIndex: number, volume: number, connectionId: number): void;
export declare function CAPIMediaNetwork_HasAudioTrack(lIndex: number, connectionId: number): boolean;
export declare function CAPIMediaNetwork_HasVideoTrack(lIndex: number, connectionId: number): boolean;
export declare function CAPIMediaNetwork_SetMute(lIndex: number, value: boolean): void;
export declare function CAPIMediaNetwork_IsMute(lIndex: number): boolean;
export declare function CAPI_DeviceApi_Update(): void;
export declare function CAPI_DeviceApi_RequestUpdate(): void;
export declare function CAPI_DeviceApi_LastUpdate(): number;
export declare function CAPI_DeviceApi_Devices_Length(): number;
export declare function CAPI_DeviceApi_Devices_Get(index: number): string;
/**
 *
 * @param loglevel
 * None = 0,
 * Errors = 1,
 * Warnings = 2,
 * Verbose = 3
 */
export declare function CAPI_SLog_SetLogLevel(loglevel: number): void;
