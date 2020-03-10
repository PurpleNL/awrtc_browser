var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { NetworkEvent, NetEventType } from "./index";
import { Queue, Helper, SLog, Debug, Random } from "./Helper";
var SignalingConfig = /** @class */ (function () {
    function SignalingConfig(network) {
        this.mNetwork = network;
    }
    SignalingConfig.prototype.GetNetwork = function () {
        return this.mNetwork;
    };
    return SignalingConfig;
}());
export { SignalingConfig };
var SignalingInfo = /** @class */ (function () {
    function SignalingInfo(id, isIncoming, timeStamp) {
        this.mConnectionId = id;
        this.mIsIncoming = isIncoming;
        this.mCreationTime = timeStamp;
        this.mSignalingConnected = true;
    }
    SignalingInfo.prototype.IsSignalingConnected = function () {
        return this.mSignalingConnected;
    };
    Object.defineProperty(SignalingInfo.prototype, "ConnectionId", {
        get: function () {
            return this.mConnectionId;
        },
        enumerable: true,
        configurable: true
    });
    SignalingInfo.prototype.IsIncoming = function () {
        return this.mIsIncoming;
    };
    SignalingInfo.prototype.GetCreationTimeMs = function () {
        return Date.now() - this.mCreationTime;
    };
    SignalingInfo.prototype.SignalingDisconnected = function () {
        this.mSignalingConnected = false;
    };
    return SignalingInfo;
}());
export { SignalingInfo };
export var WebRtcPeerState;
(function (WebRtcPeerState) {
    WebRtcPeerState[WebRtcPeerState["Invalid"] = 0] = "Invalid";
    WebRtcPeerState[WebRtcPeerState["Created"] = 1] = "Created";
    WebRtcPeerState[WebRtcPeerState["Signaling"] = 2] = "Signaling";
    WebRtcPeerState[WebRtcPeerState["SignalingFailed"] = 3] = "SignalingFailed";
    WebRtcPeerState[WebRtcPeerState["Connected"] = 4] = "Connected";
    WebRtcPeerState[WebRtcPeerState["Closing"] = 5] = "Closing";
    WebRtcPeerState[WebRtcPeerState["Closed"] = 6] = "Closed"; //either Closed call finished or closed remotely or Cleanup/Dispose finished -> peer connection is destroyed and all resources are released
})(WebRtcPeerState || (WebRtcPeerState = {}));
export var WebRtcInternalState;
(function (WebRtcInternalState) {
    WebRtcInternalState[WebRtcInternalState["None"] = 0] = "None";
    WebRtcInternalState[WebRtcInternalState["Signaling"] = 1] = "Signaling";
    WebRtcInternalState[WebRtcInternalState["SignalingFailed"] = 2] = "SignalingFailed";
    WebRtcInternalState[WebRtcInternalState["Connected"] = 3] = "Connected";
    WebRtcInternalState[WebRtcInternalState["Closed"] = 4] = "Closed"; //at least one channel was closed
})(WebRtcInternalState || (WebRtcInternalState = {}));
var AWebRtcPeer = /** @class */ (function () {
    function AWebRtcPeer(rtcConfig) {
        this.mState = WebRtcPeerState.Invalid;
        //only written during webrtc callbacks
        this.mRtcInternalState = WebRtcInternalState.None;
        this.mIncomingSignalingQueue = new Queue();
        this.mOutgoingSignalingQueue = new Queue();
        //Used to negotiate who starts the signaling if 2 peers listening
        //at the same time
        this.mDidSendRandomNumber = false;
        this.mRandomNumerSent = 0;
        this.mOfferOptions = { "offerToReceiveAudio": false, "offerToReceiveVideo": false };
        this.SetupPeer(rtcConfig);
        //remove this. it will trigger this call before the subclasses
        //are initialized
        this.OnSetup();
        this.mState = WebRtcPeerState.Created;
    }
    AWebRtcPeer.prototype.GetState = function () {
        return this.mState;
    };
    AWebRtcPeer.prototype.SetupPeer = function (rtcConfig) {
        var _this = this;
        this.mPeer = new RTCPeerConnection(rtcConfig);
        this.mPeer.onicecandidate = function (ev) { _this.OnIceCandidate(ev); };
        this.mPeer.oniceconnectionstatechange = function (ev) { _this.OnIceConnectionChange(); };
        this.mPeer.onnegotiationneeded = function (ev) { _this.OnRenegotiationNeeded(); };
        this.mPeer.onsignalingstatechange = function (ev) { _this.OnSignalingChange(); };
    };
    AWebRtcPeer.prototype.DisposeInternal = function () {
        this.Cleanup();
    };
    AWebRtcPeer.prototype.Dispose = function () {
        if (this.mPeer != null) {
            this.DisposeInternal();
        }
    };
    AWebRtcPeer.prototype.Cleanup = function () {
        //closing webrtc could cause old events to flush out -> make sure we don't call cleanup
        //recursively
        if (this.mState == WebRtcPeerState.Closed || this.mState == WebRtcPeerState.Closing) {
            return;
        }
        this.mState = WebRtcPeerState.Closing;
        this.OnCleanup();
        if (this.mPeer != null)
            this.mPeer.close();
        //js version still receives callbacks after this. would make it
        //impossible to get the state
        //this.mReliableDataChannel = null;
        //this.mUnreliableDataChannel = null;
        //this.mPeer = null;
        this.mState = WebRtcPeerState.Closed;
    };
    AWebRtcPeer.prototype.Update = function () {
        if (this.mState != WebRtcPeerState.Closed && this.mState != WebRtcPeerState.Closing && this.mState != WebRtcPeerState.SignalingFailed) {
            this.UpdateState();
            this.HandleIncomingSignaling();
        }
    };
    AWebRtcPeer.prototype.UpdateState = function () {
        //will only be entered if the current state isn't already one of the ending states (closed, closing, signalingfailed)
        if (this.mRtcInternalState == WebRtcInternalState.Closed) {
            //if webrtc switched to the closed state -> make sure everything is destroyed.
            //webrtc closed the connection. update internal state + destroy the references
            //to webrtc
            this.Cleanup();
            //mState will be Closed now as well
        }
        else if (this.mRtcInternalState == WebRtcInternalState.SignalingFailed) {
            //if webrtc switched to a state indicating the signaling process failed ->  set the whole state to failed
            //this step will be ignored if the peers are destroyed already to not jump back from closed state to failed
            this.mState = WebRtcPeerState.SignalingFailed;
        }
        else if (this.mRtcInternalState == WebRtcInternalState.Connected) {
            this.mState = WebRtcPeerState.Connected;
        }
    };
    AWebRtcPeer.prototype.HandleIncomingSignaling = function () {
        //handle the incoming messages all at once
        while (this.mIncomingSignalingQueue.Count() > 0) {
            var msgString = this.mIncomingSignalingQueue.Dequeue();
            var randomNumber = Helper.tryParseInt(msgString);
            if (randomNumber != null) {
                //was a random number for signaling negotiation
                //if this peer uses negotiation as well then
                //this would be true
                if (this.mDidSendRandomNumber) {
                    //no peer is set to start signaling -> the one with the bigger number starts
                    if (randomNumber < this.mRandomNumerSent) {
                        //own diced number was bigger -> start signaling
                        SLog.L("Signaling negotiation complete. Starting signaling.");
                        this.StartSignaling();
                    }
                    else if (randomNumber == this.mRandomNumerSent) {
                        //same numbers. restart the process
                        this.NegotiateSignaling();
                    }
                    else {
                        //wait for other peer to start signaling
                        SLog.L("Signaling negotiation complete. Waiting for signaling.");
                    }
                }
                else {
                    //ignore. this peer starts signaling automatically and doesn't use this
                    //negotiation
                }
            }
            else {
                //must be a webrtc signaling message using default json formatting
                var msg = JSON.parse(msgString);
                if (msg.sdp) {
                    var sdp = new RTCSessionDescription(msg);
                    if (sdp.type == 'offer') {
                        this.CreateAnswer(sdp);
                        //setTimeout(() => {  }, 5000);
                    }
                    else {
                        //setTimeout(() => { }, 5000);
                        this.RecAnswer(sdp);
                    }
                }
                else {
                    var ice = new RTCIceCandidate(msg);
                    if (ice != null) {
                        var promise = this.mPeer.addIceCandidate(ice);
                        promise.then(function () { });
                        promise.catch(function (error) { Debug.LogError(error); });
                    }
                }
            }
        }
    };
    AWebRtcPeer.prototype.AddSignalingMessage = function (msg) {
        Debug.Log("incoming Signaling message " + msg);
        this.mIncomingSignalingQueue.Enqueue(msg);
    };
    AWebRtcPeer.prototype.DequeueSignalingMessage = function (/*out*/ msg) {
        //lock might be not the best way to deal with this
        //lock(mOutgoingSignalingQueue)
        {
            if (this.mOutgoingSignalingQueue.Count() > 0) {
                msg.val = this.mOutgoingSignalingQueue.Dequeue();
                return true;
            }
            else {
                msg.val = null;
                return false;
            }
        }
    };
    AWebRtcPeer.prototype.EnqueueOutgoing = function (msg) {
        //lock(mOutgoingSignalingQueue)
        {
            Debug.Log("Outgoing Signaling message " + msg);
            this.mOutgoingSignalingQueue.Enqueue(msg);
        }
    };
    AWebRtcPeer.prototype.StartSignaling = function () {
        this.OnStartSignaling();
        this.CreateOffer();
    };
    AWebRtcPeer.prototype.NegotiateSignaling = function () {
        var nb = Random.getRandomInt(0, 2147483647);
        this.mRandomNumerSent = nb;
        this.mDidSendRandomNumber = true;
        this.EnqueueOutgoing("" + nb);
    };
    AWebRtcPeer.prototype.CreateOffer = function () {
        var _this = this;
        Debug.Log("CreateOffer");
        var createOfferPromise = this.mPeer.createOffer(this.mOfferOptions);
        createOfferPromise.then(function (desc) {
            var msg = JSON.stringify(desc);
            var setDescPromise = _this.mPeer.setLocalDescription(desc);
            setDescPromise.then(function () {
                _this.RtcSetSignalingStarted();
                _this.EnqueueOutgoing(msg);
            });
            setDescPromise.catch(function (error) {
                Debug.LogError(error);
                _this.RtcSetSignalingFailed();
            });
        });
        createOfferPromise.catch(function (error) {
            Debug.LogError(error);
            _this.RtcSetSignalingFailed();
        });
    };
    AWebRtcPeer.prototype.CreateAnswer = function (offer) {
        var _this = this;
        Debug.Log("CreateAnswer");
        var remoteDescPromise = this.mPeer.setRemoteDescription(offer);
        remoteDescPromise.then(function () {
            var createAnswerPromise = _this.mPeer.createAnswer();
            createAnswerPromise.then(function (desc) {
                var msg = JSON.stringify(desc);
                var localDescPromise = _this.mPeer.setLocalDescription(desc);
                localDescPromise.then(function () {
                    _this.RtcSetSignalingStarted();
                    _this.EnqueueOutgoing(msg);
                });
                localDescPromise.catch(function (error) {
                    Debug.LogError(error);
                    _this.RtcSetSignalingFailed();
                });
            });
            createAnswerPromise.catch(function (error) {
                Debug.LogError(error);
                _this.RtcSetSignalingFailed();
            });
        });
        remoteDescPromise.catch(function (error) {
            Debug.LogError(error);
            _this.RtcSetSignalingFailed();
        });
    };
    AWebRtcPeer.prototype.RecAnswer = function (answer) {
        var _this = this;
        Debug.Log("RecAnswer");
        var remoteDescPromise = this.mPeer.setRemoteDescription(answer);
        remoteDescPromise.then(function () {
            //all done
        });
        remoteDescPromise.catch(function (error) {
            Debug.LogError(error);
            _this.RtcSetSignalingFailed();
        });
    };
    AWebRtcPeer.prototype.RtcSetSignalingStarted = function () {
        if (this.mRtcInternalState == WebRtcInternalState.None) {
            this.mRtcInternalState = WebRtcInternalState.Signaling;
        }
    };
    AWebRtcPeer.prototype.RtcSetSignalingFailed = function () {
        this.mRtcInternalState = WebRtcInternalState.SignalingFailed;
    };
    AWebRtcPeer.prototype.RtcSetConnected = function () {
        if (this.mRtcInternalState == WebRtcInternalState.Signaling)
            this.mRtcInternalState = WebRtcInternalState.Connected;
    };
    AWebRtcPeer.prototype.RtcSetClosed = function () {
        if (this.mRtcInternalState == WebRtcInternalState.Connected)
            this.mRtcInternalState = WebRtcInternalState.Closed;
    };
    AWebRtcPeer.prototype.OnIceCandidate = function (ev) {
        if (ev && ev.candidate) {
            var candidate = ev.candidate;
            var msg = JSON.stringify(candidate);
            this.EnqueueOutgoing(msg);
        }
    };
    AWebRtcPeer.prototype.OnIceConnectionChange = function () {
        Debug.Log(this.mPeer.iceConnectionState);
        if (this.mPeer.iceConnectionState == "failed") {
            if (this.mState == WebRtcPeerState.Signaling) {
                this.RtcSetSignalingFailed();
            }
            else if (this.mState == WebRtcPeerState.Connected) {
                this.RtcSetClosed();
            }
        }
    };
    AWebRtcPeer.prototype.OnIceGatheringChange = function ( /*new_state: RTCIceGatheringState*/) {
        Debug.Log(this.mPeer.iceGatheringState);
    };
    AWebRtcPeer.prototype.OnRenegotiationNeeded = function () { };
    AWebRtcPeer.prototype.OnSignalingChange = function ( /*new_state: RTCSignalingState*/) {
        Debug.Log(this.mPeer.signalingState);
        if (this.mPeer.signalingState == "closed") {
            this.RtcSetClosed();
        }
    };
    return AWebRtcPeer;
}());
export { AWebRtcPeer };
var WebRtcDataPeer = /** @class */ (function (_super) {
    __extends(WebRtcDataPeer, _super);
    function WebRtcDataPeer(id, rtcConfig) {
        var _this = _super.call(this, rtcConfig) || this;
        _this.mInfo = null;
        _this.mEvents = new Queue();
        _this.mReliableDataChannelReady = false;
        _this.mUnreliableDataChannelReady = false;
        _this.mConnectionId = id;
        return _this;
    }
    Object.defineProperty(WebRtcDataPeer.prototype, "ConnectionId", {
        get: function () {
            return this.mConnectionId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebRtcDataPeer.prototype, "SignalingInfo", {
        get: function () {
            return this.mInfo;
        },
        enumerable: true,
        configurable: true
    });
    WebRtcDataPeer.prototype.SetSignalingInfo = function (info) {
        this.mInfo = info;
    };
    WebRtcDataPeer.prototype.OnSetup = function () {
        var _this = this;
        this.mPeer.ondatachannel = function (ev) { _this.OnDataChannel(ev.channel); };
    };
    WebRtcDataPeer.prototype.OnStartSignaling = function () {
        var configReliable = {};
        this.mReliableDataChannel = this.mPeer.createDataChannel(WebRtcDataPeer.sLabelReliable, configReliable);
        this.RegisterObserverReliable();
        var configUnreliable = {};
        configUnreliable.maxRetransmits = 0;
        configUnreliable.ordered = false;
        this.mUnreliableDataChannel = this.mPeer.createDataChannel(WebRtcDataPeer.sLabelUnreliable, configUnreliable);
        this.RegisterObserverUnreliable();
    };
    WebRtcDataPeer.prototype.OnCleanup = function () {
        if (this.mReliableDataChannel != null)
            this.mReliableDataChannel.close();
        if (this.mUnreliableDataChannel != null)
            this.mUnreliableDataChannel.close();
        //dont set to null. handlers will be called later
    };
    WebRtcDataPeer.prototype.RegisterObserverReliable = function () {
        var _this = this;
        this.mReliableDataChannel.onmessage = function (event) { _this.ReliableDataChannel_OnMessage(event); };
        this.mReliableDataChannel.onopen = function (event) { _this.ReliableDataChannel_OnOpen(); };
        this.mReliableDataChannel.onclose = function (event) { _this.ReliableDataChannel_OnClose(); };
        this.mReliableDataChannel.onerror = function (event) { _this.ReliableDataChannel_OnError(""); }; //should the event just be a string?
    };
    WebRtcDataPeer.prototype.RegisterObserverUnreliable = function () {
        var _this = this;
        this.mUnreliableDataChannel.onmessage = function (event) { _this.UnreliableDataChannel_OnMessage(event); };
        this.mUnreliableDataChannel.onopen = function (event) { _this.UnreliableDataChannel_OnOpen(); };
        this.mUnreliableDataChannel.onclose = function (event) { _this.UnreliableDataChannel_OnClose(); };
        this.mUnreliableDataChannel.onerror = function (event) { _this.UnreliableDataChannel_OnError(""); }; //should the event just be a string?
    };
    WebRtcDataPeer.prototype.SendData = function (data, /* offset : number, length : number,*/ reliable) {
        //let buffer: ArrayBufferView = data.subarray(offset, offset + length) as ArrayBufferView;
        var buffer = data;
        var MAX_SEND_BUFFER = 1024 * 1024;
        //chrome bug: If the channels is closed remotely trough disconnect
        //then the local channel can appear open but will throw an exception
        //if send is called
        var sentSuccessfully = false;
        try {
            if (reliable) {
                if (this.mReliableDataChannel.readyState === "open") {
                    //bugfix: WebRTC seems to simply close the data channel if we send
                    //too much at once. avoid this from now on by returning false
                    //if the buffer gets too full
                    if ((this.mReliableDataChannel.bufferedAmount + buffer.byteLength) < MAX_SEND_BUFFER) {
                        this.mReliableDataChannel.send(buffer);
                        sentSuccessfully = true;
                    }
                }
            }
            else {
                if (this.mUnreliableDataChannel.readyState === "open") {
                    if ((this.mUnreliableDataChannel.bufferedAmount + buffer.byteLength) < MAX_SEND_BUFFER) {
                        this.mUnreliableDataChannel.send(buffer);
                        sentSuccessfully = true;
                    }
                }
            }
        }
        catch (e) {
            SLog.LogError("Exception while trying to send: " + e);
        }
        return sentSuccessfully;
    };
    WebRtcDataPeer.prototype.DequeueEvent = function (/*out*/ ev) {
        //lock(mEvents)
        {
            if (this.mEvents.Count() > 0) {
                ev.val = this.mEvents.Dequeue();
                return true;
            }
        }
        return false;
    };
    WebRtcDataPeer.prototype.Enqueue = function (ev) {
        //lock(mEvents)
        {
            this.mEvents.Enqueue(ev);
        }
    };
    WebRtcDataPeer.prototype.OnDataChannel = function (data_channel) {
        var newChannel = data_channel;
        if (newChannel.label == WebRtcDataPeer.sLabelReliable) {
            this.mReliableDataChannel = newChannel;
            this.RegisterObserverReliable();
        }
        else if (newChannel.label == WebRtcDataPeer.sLabelUnreliable) {
            this.mUnreliableDataChannel = newChannel;
            this.RegisterObserverUnreliable();
        }
        else {
            Debug.LogError("Datachannel with unexpected label " + newChannel.label);
        }
    };
    WebRtcDataPeer.prototype.RtcOnMessageReceived = function (event, reliable) {
        var eventType = NetEventType.UnreliableMessageReceived;
        if (reliable) {
            eventType = NetEventType.ReliableMessageReceived;
        }
        //async conversion to blob/arraybuffer here
        if (event.data instanceof ArrayBuffer) {
            var buffer = new Uint8Array(event.data);
            this.Enqueue(new NetworkEvent(eventType, this.mConnectionId, buffer));
        }
        else if (event.data instanceof Blob) {
            var connectionId = this.mConnectionId;
            var fileReader = new FileReader();
            var self = this;
            fileReader.onload = function () {
                //need to use function as this pointer is needed to reference to the data
                var data = this.result;
                var buffer = new Uint8Array(data);
                self.Enqueue(new NetworkEvent(eventType, self.mConnectionId, buffer));
            };
            fileReader.readAsArrayBuffer(event.data);
        }
        else {
            Debug.LogError("Invalid message type. Only blob and arraybuffer supported: " + event.data);
        }
    };
    WebRtcDataPeer.prototype.ReliableDataChannel_OnMessage = function (event) {
        Debug.Log("ReliableDataChannel_OnMessage ");
        this.RtcOnMessageReceived(event, true);
    };
    WebRtcDataPeer.prototype.ReliableDataChannel_OnOpen = function () {
        Debug.Log("mReliableDataChannelReady");
        this.mReliableDataChannelReady = true;
        if (this.IsRtcConnected()) {
            this.RtcSetConnected();
            Debug.Log("Fully connected");
        }
    };
    WebRtcDataPeer.prototype.ReliableDataChannel_OnClose = function () {
        this.RtcSetClosed();
    };
    WebRtcDataPeer.prototype.ReliableDataChannel_OnError = function (errorMsg) {
        Debug.LogError(errorMsg);
        this.RtcSetClosed();
    };
    WebRtcDataPeer.prototype.UnreliableDataChannel_OnMessage = function (event) {
        Debug.Log("UnreliableDataChannel_OnMessage ");
        this.RtcOnMessageReceived(event, false);
    };
    WebRtcDataPeer.prototype.UnreliableDataChannel_OnOpen = function () {
        Debug.Log("mUnreliableDataChannelReady");
        this.mUnreliableDataChannelReady = true;
        if (this.IsRtcConnected()) {
            this.RtcSetConnected();
            Debug.Log("Fully connected");
        }
    };
    WebRtcDataPeer.prototype.UnreliableDataChannel_OnClose = function () {
        this.RtcSetClosed();
    };
    WebRtcDataPeer.prototype.UnreliableDataChannel_OnError = function (errorMsg) {
        Debug.LogError(errorMsg);
        this.RtcSetClosed();
    };
    WebRtcDataPeer.prototype.IsRtcConnected = function () {
        return this.mReliableDataChannelReady && this.mUnreliableDataChannelReady;
    };
    WebRtcDataPeer.sLabelReliable = "reliable";
    WebRtcDataPeer.sLabelUnreliable = "unreliable";
    return WebRtcDataPeer;
}(AWebRtcPeer));
export { WebRtcDataPeer };
//# sourceMappingURL=WebRtcPeer.js.map