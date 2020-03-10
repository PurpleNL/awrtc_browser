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
import { SLog } from "../network/index";
var DeviceInfo = /** @class */ (function () {
    function DeviceInfo() {
        this.deviceId = null;
        this.defaultLabel = null;
        this.label = null;
        this.isLabelGuessed = true;
    }
    return DeviceInfo;
}());
export { DeviceInfo };
var DeviceApi = /** @class */ (function () {
    function DeviceApi() {
    }
    Object.defineProperty(DeviceApi, "LastUpdate", {
        get: function () {
            return DeviceApi.sLastUpdate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DeviceApi, "HasInfo", {
        get: function () {
            return DeviceApi.sLastUpdate > 0;
        },
        enumerable: true,
        configurable: true
    });
    DeviceApi.AddOnChangedHandler = function (evt) {
        DeviceApi.sUpdateEvents.push(evt);
    };
    DeviceApi.RemOnChangedHandler = function (evt) {
        var index = DeviceApi.sUpdateEvents.indexOf(evt);
        if (index >= 0)
            DeviceApi.sUpdateEvents.splice(index, 1);
    };
    DeviceApi.TriggerChangedEvent = function () {
        for (var _i = 0, _a = DeviceApi.sUpdateEvents; _i < _a.length; _i++) {
            var v = _a[_i];
            try {
                v();
            }
            catch (e) {
                SLog.LE("Error in DeviceApi user event handler: " + e);
                console.exception(e);
            }
        }
    };
    Object.defineProperty(DeviceApi, "Devices", {
        get: function () {
            return DeviceApi.sDeviceInfo;
        },
        enumerable: true,
        configurable: true
    });
    DeviceApi.Reset = function () {
        DeviceApi.sUpdateEvents = [];
        DeviceApi.sLastUpdate = 0;
        DeviceApi.sDeviceInfo = {};
        DeviceApi.sVideoDeviceCounter = 1;
        DeviceApi.sAccessStream = null;
    };
    /**Updates the device list based on the current
     * access. Given devices numbers if the name isn't known.
     */
    DeviceApi.Update = function () {
        navigator.mediaDevices.enumerateDevices()
            .then(DeviceApi.InternalOnEnum)
            .catch(DeviceApi.InternalOnError);
    };
    /**Asks the user for access first to get the full
     * device names.
     */
    DeviceApi.RequestUpdate = function () {
        var constraints = { video: true };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(DeviceApi.InternalOnStream)
            .catch(DeviceApi.InternalOnError);
    };
    DeviceApi.GetDeviceId = function (label) {
        var devs = DeviceApi.Devices;
        for (var key in devs) {
            var dev = devs[key];
            if (dev.label == label || dev.defaultLabel == label || dev.deviceId == label) {
                return dev.deviceId;
            }
        }
        return null;
    };
    DeviceApi.sLastUpdate = 0;
    DeviceApi.sDeviceInfo = {};
    DeviceApi.sVideoDeviceCounter = 1;
    DeviceApi.sAccessStream = null;
    DeviceApi.sUpdateEvents = [];
    DeviceApi.InternalOnEnum = function (devices) {
        DeviceApi.sLastUpdate = new Date().getTime();
        var newDeviceInfo = {};
        for (var _i = 0, devices_1 = devices; _i < devices_1.length; _i++) {
            var info = devices_1[_i];
            if (info.kind != "videoinput")
                continue;
            var newInfo = new DeviceInfo();
            newInfo.deviceId = info.deviceId;
            var knownInfo = null;
            if (newInfo.deviceId in DeviceApi.Devices) {
                //known device. reuse the default label
                knownInfo = DeviceApi.Devices[newInfo.deviceId];
            }
            //check if we gave this device a default label already
            //this is used to identify it via a user readable name in case
            //we update multiple times with proper labels / default labels
            if (knownInfo != null) {
                newInfo.defaultLabel = knownInfo.defaultLabel;
            }
            else {
                newInfo.defaultLabel = info.kind + " " + DeviceApi.sVideoDeviceCounter;
                ;
                DeviceApi.sVideoDeviceCounter++;
            }
            //check if we know a proper label or got one this update
            if (knownInfo != null && knownInfo.isLabelGuessed == false) {
                //already have one
                newInfo.label = knownInfo.label;
                newInfo.isLabelGuessed = false;
            }
            else if (info.label) {
                //got a new one
                newInfo.label = info.label;
                newInfo.isLabelGuessed = false;
            }
            else {
                //no known label -> just use the default one
                newInfo.label = newInfo.defaultLabel;
                newInfo.isLabelGuessed = true;
            }
            newDeviceInfo[newInfo.deviceId] = newInfo;
        }
        DeviceApi.sDeviceInfo = newDeviceInfo;
        if (DeviceApi.sAccessStream) {
            DeviceApi.sAccessStream.stop();
            DeviceApi.sAccessStream = null;
        }
        DeviceApi.TriggerChangedEvent();
    };
    DeviceApi.InternalOnError = function (err) {
        SLog.LE(err);
    };
    DeviceApi.InternalOnStream = function (stream) {
        DeviceApi.sAccessStream = stream;
        DeviceApi.Update();
    };
    return DeviceApi;
}());
export { DeviceApi };
//# sourceMappingURL=DeviceApi.js.map