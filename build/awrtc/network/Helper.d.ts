/**Contains some helper classes to keep the typescript implementation
 * similar to the C# implementation.
 *
 */
export declare class Queue<T> {
    private mArr;
    constructor();
    Enqueue(val: T): void;
    TryDequeue(outp: Output<T>): boolean;
    Dequeue(): T;
    Peek(): T;
    Count(): number;
    Clear(): void;
}
export declare class List<T> {
    private mArr;
    readonly Internal: Array<T>;
    constructor();
    Add(val: T): void;
    readonly Count: number;
}
export declare class Output<T> {
    val: T;
}
export declare class Debug {
    static Log(s: any): void;
    static LogError(s: any): void;
    static LogWarning(s: any): void;
}
export declare abstract class Encoder {
    abstract GetBytes(text: string): Uint8Array;
    abstract GetString(buffer: Uint8Array): string;
}
export declare class UTF16Encoding extends Encoder {
    constructor();
    GetBytes(text: string): Uint8Array;
    GetString(buffer: Uint8Array): string;
    private bufferToString;
    private stringToBuffer;
}
export declare class Encoding {
    static readonly UTF16: UTF16Encoding;
    constructor();
}
export declare class Random {
    static getRandomInt(min: any, max: any): number;
}
export declare class Helper {
    static tryParseInt(value: string): number;
}
export declare enum SLogLevel {
    None = 0,
    Errors = 1,
    Warnings = 2,
    Info = 3
}
export declare class SLog {
    private static sLogLevel;
    static SetLogLevel(level: SLogLevel): void;
    static L(msg: any): void;
    static LW(msg: any): void;
    static LE(msg: any): void;
    static Log(msg: any): void;
    static LogWarning(msg: any): void;
    static LogError(msg: any): void;
}
