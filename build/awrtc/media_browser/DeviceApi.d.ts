export declare class DeviceInfo {
    deviceId: string;
    defaultLabel: string;
    label: string;
    isLabelGuessed: boolean;
}
export interface DeviceApiOnChanged {
    (): void;
}
export declare class DeviceApi {
    private static sLastUpdate;
    static readonly LastUpdate: number;
    static readonly HasInfo: boolean;
    private static sDeviceInfo;
    private static sVideoDeviceCounter;
    private static sAccessStream;
    private static sUpdateEvents;
    static AddOnChangedHandler(evt: DeviceApiOnChanged): void;
    static RemOnChangedHandler(evt: DeviceApiOnChanged): void;
    private static TriggerChangedEvent;
    private static InternalOnEnum;
    static readonly Devices: {
        [id: string]: DeviceInfo;
    };
    static Reset(): void;
    private static InternalOnError;
    private static InternalOnStream;
    /**Updates the device list based on the current
     * access. Given devices numbers if the name isn't known.
     */
    static Update(): void;
    /**Asks the user for access first to get the full
     * device names.
     */
    static RequestUpdate(): void;
    static GetDeviceId(label: string): string;
}
