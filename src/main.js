import {log, TRACE, warn} from "./debug";
import * as WebMidi from "webmidi";
import MODEL from "./model";
import {detect} from "detect-browser";
import {URL_PARAM_BG, URL_PARAM_CLEAR_STORAGE, URL_PARAM_MARGINS, URL_PARAM_SIZE, VERSION} from "./constants";
import {loadPreferences, savePreferences, preferences} from "./preferences";
import {
    appendMessage,
    setCommunicationStatus
} from "./ui_messages";
import {setupUI} from "./ui";
import {updateSelectDeviceList} from "./ui_selects";
import {
    getMidiInput2Port,
    getMidiInputPort,
    handleCC,
    handlePC,
    handleSysex,
    setMidiInput2Port,
    setMidiInputPort
} from "./midi_in";
import {getMidiOutputPort, requestGlobalSettings, requestPreset, setMidiOutputPort} from "./midi_out";
import * as Utils from "./utils";
import {initSize} from "./ui_size";

import "./css/lity.min.css";    // CSS files order is important
import "./css/themes.css";
import "./css/main.css";
import "./css/header.css";
import "./css/size.css";
import "./css/config.css";
import "./css/info-panel.css";
import "./css/presets.css";
import "./css/controls.css";
import "./css/buttons.css";
import "./css/dialogs.css";
import "./css/global-settings.css";
import store from "storejs";

const browser = detect();

if (browser) {
    // log(browser.name);
    // log(browser.version);
    switch (browser && browser.name) {
        case "chrome":
            break;
        case "firefox":
        case "edge":
        default:
            log("unsupported browser");
            alert("Please use Chrome browser (recent version recommended). " +
                "Any other browser is unsupported at the moment and the application may not work properly or not work at all. " +
                "Thank you for your understanding.");
    }
}

//==================================================================================================================

function setupModel() {
    MODEL.init();
    MODEL.setDeviceId(preferences.midi_channel - 1);   // the device_id is the midi channel - 1
}

//==================================================================================================================

/**
 * If no preset select (preset is 0) then read the preset from the pedal, otherwise display a message to the user.
 */
function sync() {

    log('sync()');

    if (getMidiInputPort() && getMidiOutputPort()) {

        log('sync() midi in & midi out');

        appendMessage("Request global settings.");
        window.setTimeout(requestGlobalSettings, 200);

        // if (hashSysexPresent() && preferences.init_from_URL === 1) {
        //     log("sync: init from URL");
        //
        //     initFromUrl();
        //
        // } else {

            appendMessage("Request current preset.");
            window.setTimeout(() => {
                log("sync: requestPreset(true)");
                requestPreset(true);
            }, 300);

/*
            if (MODEL.getPresetNumber() === 0) {
                log("sync: no preset yet, will request preset in 200ms");
                // we wait 100ms before sending a read preset request because we, sometimes, receive 2 connect events. TODO: review connection events management
                appendMessage("Request current preset.");
                window.setTimeout(() => {
                    log("sync: requestPreset(true)");
                    requestPreset(true);
                }, 300);
            } else {
                log("sync: preset is > 0, set preset dirty");
                setPresetDirty();
                appendMessage(`Select a preset to sync the editor or use the Send command to sync the ${MODEL.name}.`, true);
            }
*/
        // }
    }

}

//==================================================================================================================
// MIDI CHANNEL:

function setMidiChannel(channel) {

    // Note: output does not use any event listener, so there's nothing to update on the output device
    //       when we only change the MIDI channel.

    log(`setMidiChannel(${channel}): disconnect input`);
    disconnectInputPort();

    // Set new channel:
    log(`setMidiChannel(${channel}): set new channel`);

    const chan = parseInt(channel, 10);
    savePreferences({midi_channel: chan});

    MODEL.setDeviceId(preferences.midi_channel - 1);    // device ID is midi channel - 1

    log(`setMidiChannel(${channel}): reconnect input ${preferences.input_device_id}`);
    connectInputDevice(preferences.input_device_id);
}

function setMidiInput2Channel(channel) {

    log(`setMidiInput2Channel(${channel}): disconnect input 2`);
    disconnectInput2Port();

    // Set new channel:
    log(`setMidiInput2Channel(${channel}): set new channel for input 2`);

    const chan = parseInt(channel, 10);
    savePreferences({input2_channel: chan});

    log(`setMidiInput2Channel(${channel}): reconnect input 2 ${preferences.input2_device_id}`);
    connectInput2Device(preferences.input2_device_id);
}

//==================================================================================================================
// MIDI INPUT:

function connectInputPort(input) {

    log(`connectInputPort(${input.id})`);

    if (!input) return;

    setMidiInputPort(input);

    input
        .on("programchange", preferences.midi_channel, function(e) {
            handlePC(e.data);
        })
        .on("controlchange", preferences.midi_channel, function(e) {
            handleCC(e.data);
        })
        .on("sysex", preferences.midi_channel, function(e) {    //FIXME: use undefined for the channel
            handleSysex(e.data);
        });

    log(`%cconnectInputPort: ${input.name} is now listening on channel ${preferences.midi_channel}`, "color: orange; font-weight: bold");
    setCommunicationStatus(true);
    // updatePresetSelector();
    appendMessage(`Input ${input.name} connected on channel ${preferences.midi_channel}.`);
}

function connectInput2Port(input) {

    log(`connectInput2Port(${input.id})`);

    if (!input) return;

    if (!preferences.input2_channel) {
        log(`connectInput2Port(${input.id}): abort because channel if not defined`);
        return;
    }

    setMidiInput2Port(input);

    input
        .on("programchange", preferences.input2_channel, function(e) {
            handlePC(e.data, 2);
        })
        .on("controlchange", preferences.input2_channel, function(e) {
            handleCC(e.data, 2);
        });

    log(`%cconnectInput2Port: ${input.name} is now listening on channel ${preferences.input2_channel}`, "color: orange; font-weight: bold");
    // setCommunicationStatus(true);
    // updatePresetSelector();
    appendMessage(`Input 2 ${input.name} connected on channel ${preferences.input2_channel}.`);
}

function disconnectInputPort() {
    const p = getMidiInputPort();
    if (p) {
        log("disconnectInputPort()");
        p.removeListener();    // remove all listeners for all channels
        setMidiInputPort(null);
        setCommunicationStatus(false);
        // updatePresetSelector();
        appendMessage(`Input disconnected.`);
    }
}

function disconnectInput2Port() {
    const p = getMidiInput2Port();
    if (p) {
        log("disconnectInput2Port()");
        p.removeListener();    // remove all listeners for all channels
        setMidiInput2Port(null);
        appendMessage(`Input 2 disconnected.`);
    }
}

/**
 *
 * @param id
 * @returns {boolean} true if a different device has been connected, false otherwise
 */
function connectInputDevice(id) {

    log(`connectInputDevice(${id})`);

    const p = getMidiInputPort();
    if (!id && p) {
        log(`connectInputDevice(): disconnect currently connected port`);
        // Update preferences for autoloading at next restart:
        savePreferences({input_device_id: null});
        // The user selected no device, disconnect.
        disconnectInputPort();
        setCommunicationStatus(false);
        return false;
    }

    // Do nothing if already connected to the selected device:
    if (p && (p.id === id)) {
        log(`connectInputDevice(${id}): port is already connected`);
        return false;
    }

    // Update preferences for autoloading at next restart:
    savePreferences({input_device_id: id});

    // We only handle one connection, so we disconnected any connected port before connecting the new one.
    disconnectInputPort();

    // noinspection JSUnresolvedFunction
    const port = WebMidi.getInputById(id);
    if (port) {
        connectInputPort(port);
        sync();
        return true;
    } else {
        appendMessage(`Connect the ${MODEL.name} or check the MIDI channel.`);
        setCommunicationStatus(false);
    }

    return false;
}

function connectInput2Device(id) {

    log(`connectInput2Device(${id})`);

    const p = getMidiInput2Port();
    if (!id && p) {
        log(`connectInput2Device(): disconnect currently connected port`);
        // Update preferences for autoloading at next restart:
        savePreferences({input2_device_id: null});
        // The user selected no device, disconnect.
        disconnectInput2Port();
        // setCommunicationStatus(false);
        return false;
    }

    // Do nothing if already connected to the selected device:
    if (p && (p.id === id)) {
        log(`connectInput2Device(${id}): port is already connected`);
        return false;
    }

    // Update preferences for autoloading at next restart:
    savePreferences({input2_device_id: id});

    // We only handle one connection, so we disconnected any connected port before connecting the new one.
    disconnectInput2Port();

    // noinspection JSUnresolvedFunction
    const port = WebMidi.getInputById(id);
    if (port) {
        connectInput2Port(port);
        // sync();
        return true;
    // } else {
        // appendMessage(`Connect the ${MODEL.name} or check the MIDI channel.`);
        // setCommunicationStatus(false);
    }

    return false;
}

//==================================================================================================================
// MIDI OUTPUT:

function connectOutputPort(output) {
    log("connectOutputPort");
    setMidiOutputPort(output);
    log(`%cconnectOutputPort: ${output.name} can now be used to send data on channel ${preferences.midi_channel}`, "color: orange; font-weight: bold");
    // updatePresetSelector();
    appendMessage(`Output ${output.name} connected on channel ${preferences.midi_channel}.`);
}

function disconnectOutputPort() {
    const p = getMidiOutputPort();
    if (p) {
        log("disconnectOutputPort()");
        setMidiOutputPort(null);
        log("disconnectOutputPort: connectOutputPort: midi_output can not be used anymore");
        // updatePresetSelector();
        appendMessage(`Output disconnected.`);
    }
}

/**
 *
 * @param id
 * @returns {boolean} true if a different device has been connected, false otherwise
 */
function connectOutputDevice(id) {

    log(`connectOutputDevice(${id})`, preferences.output_device_id);

    const p = getMidiOutputPort();

    if (!id && p) {
        log(`connectOutputDevice(): disconnect currently connected port`);
        // Update preferences for autoloading at next restart:
        savePreferences({output_device_id: null});
        // The user selected no device, disconnect.
        disconnectOutputPort();
        setCommunicationStatus(false);
        return false;
    }

    // do nothing if already connected to the selected device:
    if (p && (p.id === id)) {   //TODO: make as a function in midi_out.js
        log(`setOutputDevice(${id}): port is already connected`);
        return false;
    }

    // Update preferences for autoloading at next restart:
    savePreferences({output_device_id: id});

    // We only handle one connection, so we disconnected any connected port before connecting the new one.
    disconnectOutputPort();

    // noinspection JSUnresolvedFunction
    const port = WebMidi.getOutputById(id);
    if (port) {
        connectOutputPort(port);
        sync();
        return true;
    }

    return false;
}

//==================================================================================================================

/**
 * The is the event handler for the "device connected" event.
 * If we have a preferred device set in settings AND if there is no device connected yet and if the saved device corresponds
 * to the event's device, then we connect it. Otherwise we just update the device list.
 * @param info
 */
function deviceConnected(info) {

    if (TRACE) console.group("%cdeviceConnected event", "color: yellow; font-weight: bold", info.port.id, info.port.type, info.port.name);

    // let input_connected = false;
    // let output_connected = false;

    if (info.port.type === 'input') {
        if ((getMidiInputPort() === null) && (info.port.id === preferences.input_device_id)) {
            // log("deviceConnected: input device is ");
            /*input_connected =*/ connectInputDevice(preferences.input_device_id);
        // } else {
        //     log("deviceConnected: input device ignored");
        }

        // if (preferences.enable_midi_in2) {
        //     log("deviceConnected: input2 is enabled");
            if ((getMidiInput2Port() === null) && (info.port.id === preferences.input2_device_id)) {
                connectInput2Device(preferences.input2_device_id);
            // } else {
            //     log("deviceConnected: input2 device ignored or not defined by user");
            }
        // }
    }

    if (info.port.type === 'output') {
        if ((getMidiOutputPort() === null) && (info.port.id === preferences.output_device_id)) {
            /*output_connected =*/ connectOutputDevice(preferences.output_device_id);
        // } else {
        //     log("deviceConnected: output device ignored or not defined by user");
        }
    }

    updateSelectDeviceList();

/*
    if (input_connected && output_connected && getMidiInputPort() && getMidiOutputPort()) {
        log("deviceConnected: we can sync; check if hash present");
        if (hashSysexPresent() && preferences.init_from_URL === 1) {
            initFromUrl();
        }
    }
*/

    if (TRACE) console.groupEnd();
}

/**
 *
 * @param info
 */
function deviceDisconnected(info) {
    log("%cdeviceDisconnected event", "color: orange; font-weight: bold", info.port.id, info.port.type, info.port.name);

    const p_in = getMidiInputPort();
    if (p_in && info.port.id === p_in.id) {
        disconnectInputPort();
    }
    const p_out = getMidiOutputPort();
    if (p_out && info.port.id === p_out.id) {       //TODO: make as a function in midi_out.js
        disconnectOutputPort();
    }

    const exp_p_in = getMidiInput2Port();
    if (exp_p_in && info.port.id === exp_p_in.id) {
        disconnectInput2Port();
    }

    updateSelectDeviceList();
}

//==================================================================================================================
// Main

$(function () {

    log(`${MODEL.name} editor ${VERSION}`);

    loadPreferences();
    setupModel();
    setupUI(setMidiChannel, connectInputDevice, connectOutputDevice, setMidiInput2Channel, connectInput2Device);

    const s = Utils.getParameterByName(URL_PARAM_SIZE);
    if (s) {
        let z = preferences.zoom_level;
        switch (s.toUpperCase()) {
            case "0" :
            case "S" :
            case "SMALL" :
              z = 0; break;
            case "1" :
            case "M" :
            case "NORMAL" :
            case "DEFAULT" :
                z = 1; break;
            case "2" :
            case "L" :
            case "LARGE" :
            case "BIG" :
                z = 2; break;
        }
        if (z !== preferences.zoom_level) {
            initSize(z);
        }
    }

    const margins = Utils.getParameterByName(URL_PARAM_MARGINS);
    if (margins) {
        $("#wrapper").css("margin", margins);
    }

    const bg = Utils.getParameterByName(URL_PARAM_BG);
    if (bg) {
        //TODO: check bg validity
        $("body").css("background-color", bg);
    }

    const cs = Utils.getParameterByName(URL_PARAM_CLEAR_STORAGE);
    if (cs) {
        store.clear();
        alert("All local storage used by the Editor has been deleted.");
    }

    // setupUrlSupport();
    // startUrlAutomation();

    appendMessage("Waiting for MIDI interface access...");

    // noinspection JSUnresolvedFunction
    WebMidi.enable(function (err) {

        if (err) {

            warn("WebMidi unavailable", err);

            appendMessage("ERROR: WebMidi could not be enabled.");
            appendMessage("-- PLEASE ENABLE MIDI IN YOUR BROWSER --");

            // Even we don't have MIDI available, we update at least the UI:
            // initFromUrl(false);

        } else {

            log("WebMidi enabled");

            appendMessage("WebMidi enabled.");

            if (TRACE) {
                // noinspection JSUnresolvedVariable
                WebMidi.inputs.map(i => console.log("available input: ", i.type, i.name, i.id));
                // noinspection JSUnresolvedVariable
                WebMidi.outputs.map(i => console.log("available output: ", i.type, i.name, i.id));
            }

            // noinspection JSUnresolvedFunction
            WebMidi.addListener("connected", e => deviceConnected(e));
            // noinspection JSUnresolvedFunction
            WebMidi.addListener("disconnected", e => deviceDisconnected(e));
        }

    }, true);   // pass true to enable sysex support

});
