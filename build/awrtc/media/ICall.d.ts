import { CallEventHandler } from "./CallEventArgs";
import { ConnectionId } from "../network/index";
import { MediaConfig } from "./MediaConfig";
/** Mostly the same as the C# side ICall interface.
 *
 * Usage of this interface usually follows a specific pattern:
 * 1. Create a platform specific instance via a factory with a specific
 * NetworkConfig
 * 2. Register an event handler at CallEvent and call Update regularly
 * (ideally once for each frame shown to the user in realtime
 * applcations so 30-60 times per second)
 * 3. Call configure with your own MediaConfig instance defining what
 * features you need.
 * 4. Wait for a ConfigurationComplete (or failed) event. During this
 * time the platform might ask the user the allow access to the devices.
 * 5. Either call Listen with an address to wait for an incoming connection
 * or use Call to conect another ICall that already listens on that address.
 * 6. Wait for CallAccepted and other events. The call is now active and
 *    you can use Send messages, change volume, ...
 * 7. Call Dispose to cleanup
 *
 * Do not forget to call Dispose method after you finished the call or the connection
 * might run forever in the background!
 *
 * See example apps and guides for more information.
 */
export interface ICall {
    addEventListener(listener: CallEventHandler): void;
    removeEventListener(listener: CallEventHandler): void;
    Call(address: string): void;
    Configure(config: MediaConfig): void;
    Listen(address: string): void;
    Send(message: string, reliable?: boolean, id?: ConnectionId): void;
    SendData(message: Uint8Array, reliable: boolean, id: ConnectionId): void;
    Update(): void;
    Dispose(): void;
}
