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
import { RawFrame, LazyFrame } from "../media/RawFrame";
import { SLog } from "../network/Helper";
/**Internal use only.
 * Bundles all functionality related to MediaStream, Tracks and video processing.
 * It creates two HTML elements: Video and Canvas to interact with the video stream
 * and convert the visible frame data to Uint8Array for compatibility with the
 * unity plugin and all other platforms.
 *
 */
var BrowserMediaStream = /** @class */ (function () {
    function BrowserMediaStream(stream) {
        this.mBufferedFrame = null;
        this.mInstanceId = 0;
        this.mCanvasElement = null;
        this.mIsActive = false;
        this.mMsPerFrame = 1.0 / BrowserMediaStream.DEFAULT_FRAMERATE * 1000;
        this.mFrameRateKnown = false;
        //Time the last frame was generated
        this.mLastFrameTime = 0;
        /** Number of the last frame (not yet supported in all browsers)
         * if it remains at <= 0 then we just generate frames based on
         * the timer above
         */
        this.mLastFrameNumber = 0;
        this.mHasVideo = false;
        this.InternalStreamAdded = null;
        this.mStream = stream;
        this.mInstanceId = BrowserMediaStream.sNextInstanceId;
        BrowserMediaStream.sNextInstanceId++;
        if (this.mStream.getVideoTracks().length > 0) {
            this.mHasVideo = true;
            var vtrack = this.mStream.getVideoTracks()[0];
            var settings = vtrack.getSettings();
            var fps = settings.frameRate;
            if (fps) {
                this.mMsPerFrame = 1.0 / fps * 1000;
                this.mFrameRateKnown = true;
            }
        }
        this.SetupElements();
    }
    Object.defineProperty(BrowserMediaStream.prototype, "Stream", {
        get: function () {
            return this.mStream;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BrowserMediaStream.prototype, "VideoElement", {
        get: function () {
            return this.mVideoElement;
        },
        enumerable: true,
        configurable: true
    });
    BrowserMediaStream.prototype.CheckFrameRate = function () {
        //in chrome the track itself might miss the framerate but
        //we still know when it updates trough webkitDecodedFrameCount
        if (this.mVideoElement && typeof this.mVideoElement.webkitDecodedFrameCount !== "undefined") {
            this.mFrameRateKnown = true;
        }
        if (this.mFrameRateKnown === false) {
            //firefox and co won't tell us the FPS for remote stream
            SLog.LW("Framerate unknown. Using default framerate of " + BrowserMediaStream.DEFAULT_FRAMERATE);
        }
    };
    BrowserMediaStream.prototype.SetupElements = function () {
        var _this = this;
        this.mVideoElement = this.SetupVideoElement();
        //TOOD: investigate bug here
        //In some cases onloadedmetadata is never called. This might happen due to a 
        //bug in firefox or might be related to a device / driver error
        //So far it only happens randomly (maybe 1 in 10 tries) on a single test device and only
        //with 720p. (video device "BisonCam, NB Pro" on MSI laptop)
        SLog.L("video element created. video tracks: " + this.mStream.getVideoTracks().length);
        this.mVideoElement.onloadedmetadata = function (e) {
            //we might have shutdown everything by now already
            if (_this.mVideoElement == null)
                return;
            _this.mVideoElement.play();
            if (_this.InternalStreamAdded != null)
                _this.InternalStreamAdded(_this);
            _this.CheckFrameRate();
            SLog.L("Resolution: " + _this.mVideoElement.videoWidth + "x" + _this.mVideoElement.videoHeight);
            //now create canvas after the meta data of the video are known
            if (_this.mHasVideo) {
                _this.mCanvasElement = _this.SetupCanvas();
                //canvas couldn't be created. set video to false
                if (_this.mCanvasElement == null)
                    _this.mHasVideo = false;
            }
            else {
                _this.mCanvasElement = null;
            }
            _this.mIsActive = true;
        };
        //set the src value and trigger onloadedmetadata above
        try {
            //newer method. not yet supported everywhere
            var element = this.mVideoElement;
            element.srcObject = this.mStream;
        }
        catch (error) {
            //old way of doing it. won't work anymore in firefox and possibly other browsers
            this.mVideoElement.src = window.URL.createObjectURL(this.mStream);
        }
    };
    /** Returns the current frame number.
     *  Treat a return value of 0 or smaller as unknown.
     * (Browsers might have the property but
     * always return 0)
     */
    BrowserMediaStream.prototype.GetFrameNumber = function () {
        var frameNumber;
        if (this.mVideoElement) {
            //to find out if we got a new frame
            //chrome has webkitDecodedFrameCount
            //firefox mozDecodedFrames, mozParsedFrames,  mozPresentedFrames seems to be always 0 so far
            //mozPaintedFrames turned out useless as it only updates if the tag is visible
            //no idea about all others
            //
            frameNumber = this.mVideoElement.webkitDecodedFrameCount
                //|| this.mVideoElement.currentTime can't be used updates every call
                || -1;
        }
        else {
            frameNumber = -1;
        }
        return frameNumber;
    };
    //TODO: Buffering
    BrowserMediaStream.prototype.TryGetFrame = function () {
        //make sure we get the newest frame
        this.EnsureLatestFrame();
        //remove the buffered frame if any
        var result = this.mBufferedFrame;
        this.mBufferedFrame = null;
        return result;
    };
    BrowserMediaStream.prototype.SetMute = function (mute) {
        this.mVideoElement.muted = mute;
    };
    BrowserMediaStream.prototype.PeekFrame = function () {
        this.EnsureLatestFrame();
        return this.mBufferedFrame;
    };
    /** Ensures we have the latest frame ready
     * for the next PeekFrame / TryGetFrame calls
     */
    BrowserMediaStream.prototype.EnsureLatestFrame = function () {
        if (this.HasNewerFrame()) {
            this.FrameToBuffer();
            return true;
        }
        return false;
    };
    /** checks if the html tag has a newer frame available
     * (or if 1/30th of a second passed since last frame if
     * this info isn't available)
     */
    BrowserMediaStream.prototype.HasNewerFrame = function () {
        if (this.mIsActive
            && this.mHasVideo
            && this.mCanvasElement != null) {
            if (this.mLastFrameNumber > 0) {
                //we are getting frame numbers. use those to 
                //check if we have a new one
                if (this.GetFrameNumber() > this.mLastFrameNumber) {
                    return true;
                }
            }
            else {
                //many browsers do not share the frame info
                //so far we just generate 30 FPS as a work around
                var now = new Date().getTime();
                var div = now - this.mLastFrameTime;
                if (div >= this.mMsPerFrame) {
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    BrowserMediaStream.prototype.Update = function () {
        //moved to avoid creating buffered frames if not needed
        //this.EnsureLatestFrame();
    };
    BrowserMediaStream.prototype.DestroyCanvas = function () {
        if (this.mCanvasElement != null && this.mCanvasElement.parentElement != null) {
            this.mCanvasElement.parentElement.removeChild(this.mCanvasElement);
        }
    };
    BrowserMediaStream.prototype.Dispose = function () {
        this.mIsActive = false;
        this.DestroyCanvas();
        if (this.mVideoElement != null && this.mVideoElement.parentElement != null) {
            this.mVideoElement.parentElement.removeChild(this.mVideoElement);
        }
        //track cleanup is probably not needed but
        //it might help ensure it properly stops
        //in case there are other references out there
        var tracks = this.mStream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }
        this.mStream = null;
        this.mVideoElement = null;
        this.mCanvasElement = null;
    };
    BrowserMediaStream.prototype.CreateFrame = function () {
        this.mCanvasElement.width = this.mVideoElement.videoWidth;
        this.mCanvasElement.height = this.mVideoElement.videoHeight;
        var ctx = this.mCanvasElement.getContext("2d");
        var fillBackgroundFirst = true;
        if (fillBackgroundFirst) {
            ctx.clearRect(0, 0, this.mCanvasElement.width, this.mCanvasElement.height);
        }
        ctx.drawImage(this.mVideoElement, 0, 0);
        try {
            //risk of security exception in firefox
            var imgData = ctx.getImageData(0, 0, this.mCanvasElement.width, this.mCanvasElement.height);
            var imgRawData = imgData.data;
            var array = new Uint8Array(imgRawData.buffer);
            return new RawFrame(array, this.mCanvasElement.width, this.mCanvasElement.height);
        }
        catch (exception) {
            //show white frame for now
            var array = new Uint8Array(this.mCanvasElement.width * this.mCanvasElement.height * 4);
            array.fill(255, 0, array.length - 1);
            var res = new RawFrame(array, this.mCanvasElement.width, this.mCanvasElement.height);
            //attempted workaround for firefox bug / suspected cause: 
            // * root cause seems to be an internal origin-clean flag within the canvas. If set to false reading from the
            //   canvas triggers a security exceptions. This is usually used if the canvas contains data that isn't 
            //   suppose to be accessible e.g. a picture from another domain
            // * while moving the image to the canvas the origin-clean flag seems to be set to false but only 
            //   during the first few frames. (maybe a race condition within firefox? A higher CPU workload increases the risk)
            // * the canvas will work and look just fine but calling getImageData isn't allowed anymore
            // * After a few frames the video is back to normal but the canvas will still have the flag set to false
            // 
            //Solution:
            // * Recreate the canvas if the exception is triggered. During the next few frames firefox should get its flag right
            //   and then stop causing the error. It might recreate the canvas multiple times until it finally works as we
            //   can't detect if the video element will trigger the issue until we tried to access the data
            SLog.LogWarning("Firefox workaround: Refused access to the remote video buffer. Retrying next frame...");
            this.DestroyCanvas();
            this.mCanvasElement = this.SetupCanvas();
            return res;
        }
    };
    BrowserMediaStream.prototype.FrameToBuffer = function () {
        this.mLastFrameTime = new Date().getTime();
        this.mLastFrameNumber = this.GetFrameNumber();
        this.mBufferedFrame = new LazyFrame(this);
    };
    BrowserMediaStream.prototype.SetupVideoElement = function () {
        var videoElement = document.createElement("video");
        //width/doesn't seem to be important
        videoElement.width = 320;
        videoElement.height = 240;
        videoElement.controls = true;
        videoElement.id = "awrtc_mediastream_video_" + this.mInstanceId;
        //videoElement.muted = true;
        if (BrowserMediaStream.DEBUG_SHOW_ELEMENTS)
            document.body.appendChild(videoElement);
        return videoElement;
    };
    BrowserMediaStream.prototype.SetupCanvas = function () {
        if (this.mVideoElement == null || this.mVideoElement.videoWidth <= 0 ||
            this.mVideoElement.videoHeight <= 0)
            return null;
        var canvas = document.createElement("canvas");
        canvas.width = this.mVideoElement.videoWidth;
        canvas.height = this.mVideoElement.videoHeight;
        canvas.id = "awrtc_mediastream_canvas_" + this.mInstanceId;
        if (BrowserMediaStream.DEBUG_SHOW_ELEMENTS)
            document.body.appendChild(canvas);
        return canvas;
    };
    BrowserMediaStream.prototype.SetVolume = function (volume) {
        if (this.mVideoElement == null) {
            return;
        }
        if (volume < 0)
            volume = 0;
        if (volume > 1)
            volume = 1;
        this.mVideoElement.volume = volume;
    };
    BrowserMediaStream.prototype.HasAudioTrack = function () {
        if (this.mStream != null && this.mStream.getAudioTracks() != null
            && this.mStream.getAudioTracks().length > 0) {
            return true;
        }
        return false;
    };
    BrowserMediaStream.prototype.HasVideoTrack = function () {
        if (this.mStream != null && this.mStream.getVideoTracks() != null
            && this.mStream.getVideoTracks().length > 0) {
            return true;
        }
        return false;
    };
    //no double buffering in java script as it forces us to create a new frame each time
    //for debugging. Will attach the HTMLVideoElement used to play the local and remote
    //video streams to the document.
    BrowserMediaStream.DEBUG_SHOW_ELEMENTS = false;
    //TODO: remove this flag. it is now always using lazy frames
    BrowserMediaStream.sUseLazyFrames = true;
    //Gives each FrameBuffer and its HTMLVideoElement a fixed id for debugging purposes.
    BrowserMediaStream.sNextInstanceId = 1;
    //Framerate used as a workaround if
    //the actual framerate is unknown due to browser restrictions
    BrowserMediaStream.DEFAULT_FRAMERATE = 25;
    return BrowserMediaStream;
}());
export { BrowserMediaStream };
//# sourceMappingURL=BrowserMediaStream.js.map