/** Abstract interfaces and serialization to keep different
 * versions compatible to each other.
 *
 * Watch out before changing anything in this file. Content is reused
 * between webclient, signaling server and needs to remain compatible to
 * the C# implementation.
 */
export declare enum NetEventType {
    Invalid = 0,
    UnreliableMessageReceived = 1,
    ReliableMessageReceived = 2,
    ServerInitialized = 3,
    ServerInitFailed = 4,
    ServerClosed = 5,
    NewConnection = 6,
    ConnectionFailed = 7,
    Disconnected = 8,
    FatalError = 100,
    Warning = 101,
    Log = 102
}
export declare enum NetEventDataType {
    Null = 0,
    ByteArray = 1,
    UTF16String = 2
}
export declare class NetworkEvent {
    private type;
    private connectionId;
    private data;
    constructor(t: NetEventType, conId: ConnectionId, data: any);
    readonly RawData: any;
    readonly MessageData: Uint8Array;
    readonly Info: string;
    readonly Type: NetEventType;
    readonly ConnectionId: ConnectionId;
    toString(): string;
    static parseFromString(str: string): NetworkEvent;
    static toString(evt: NetworkEvent): string;
    static fromByteArray(arrin: Uint8Array): NetworkEvent;
    static toByteArray(evt: NetworkEvent): Uint8Array;
}
export declare class ConnectionId {
    static INVALID: ConnectionId;
    id: number;
    constructor(nid: number);
}
export interface INetwork {
    Dequeue(): NetworkEvent;
    Peek(): NetworkEvent;
    Flush(): void;
    SendData(id: ConnectionId, data: Uint8Array, /*offset: number, length: number,*/ reliable: boolean): boolean;
    Disconnect(id: ConnectionId): void;
    Shutdown(): void;
    Update(): void;
    Dispose(): void;
}
export interface IBasicNetwork extends INetwork {
    StartServer(address?: string): void;
    StopServer(): void;
    Connect(address: string): ConnectionId;
}
export interface IWebRtcNetwork extends IBasicNetwork {
}
