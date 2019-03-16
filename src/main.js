import {log, TRACE, warn} from "./debug";
import * as WebMidi from "webmidi";
import MODEL from "./model";
import {detect} from "detect-browser";
import {URL_PARAM_SIZE, VERSION} from "./constants";
import {loadSettings, saveSettings, preferences} from "./preferences";
import {
    appendMessage,
    clearError,
    clearStatus,
    setMidiInStatus,
    setStatus,
    setStatusError
} from "./ui_messages";
import {setupUI} from "./ui";
import {updateSelectDeviceList} from "./ui_selects";
import {getMidiInputPort, handleCC, handlePC, handleSysex, setMidiInputPort} from "./midi_in";
import {getMidiOutputPort, requestPreset, setMidiOutputPort} from "./midi_out";
import {hashSysexPresent, initFromBookmark, setupBookmarkSupport, startBookmarkAutomation} from "./url";
import "./css/lity.min.css";    // order important
import "./css/themes.css";
import "./css/main.css";
import "./css/zoom.css";
import "./css/grid-default.css";
import "./css/grid-global-settings.css";
import {setPresetDirty, showPreset} from "./ui_presets";
import * as Utils from "./utils";
import {initZoom} from "./ui_zoom";

const browser = detect();

if (browser) {
    // log(browser.name);
    // log(browser.version);
    switch (browser && browser.name) {
        case "chrome":
            // log("supported browser");
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
// MIDI CHANNEL:

function setMidiChannel(midi_channel) {

    // Note: output does not use any event listener, so there's nothing to update on the output device when we only
    //       change the MIDI channel.

    log(`setMidiChannel(${midi_channel}): disconnect input`);
    disconnectInputPort();

    // Set new channel:
    log(`setMidiChannel(${midi_channel}): set new channel`);

    const chan = parseInt(midi_channel, 10);

    saveSettings({midi_channel: chan});

    MODEL.setDeviceId(preferences.midi_channel - 1);    // device ID is midi channel - 1

    log(`setMidiChannel(${midi_channel}): reconnect input ${preferences.input_device_id}`);
    connectInputDevice(preferences.input_device_id);
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
        .on("sysex", preferences.midi_channel, function(e) {
            handleSysex(e.data);
        });

    log(`%cconnectInputPort: ${input.name} is now listening on channel ${preferences.midi_channel}`, "color: orange; font-weight: bold");
    setMidiInStatus(true);
    clearError();
    // setStatus(`${input.name} connected on MIDI channel ${settings.midi_channel}.`, MSG_SEND_SYSEX);
    setStatus(`Input ${input.name} connected on MIDI channel ${preferences.midi_channel}.`);

    if (MODEL.getPresetNumber() !== 0) {
        // setPresetDirty();
        showPreset();
    }

}

function disconnectInputPort() {
    const p = getMidiInputPort();
    if (p) {
        log("disconnectInputPort()");
        p.removeListener();    // remove all listeners for all channels
        setMidiInputPort(null);
        log("disconnectInputPort: midi_input does not listen anymore");
        setStatus(`Input disconnected.`);
        if (MODEL.getPresetNumber() !== 0) {
            // setPresetDirty();
            showPreset();
        }
    }
    setMidiInStatus(false);
}

function connectInputDevice(id) {

    log(`connectInputDevice(${id})`);

    const p = getMidiInputPort();
    if (!id && p) {
        log(`connectInputDevice(): disconnect currently connected port`);
        // save in settings for autoloading at next restart:
        saveSettings({input_device_id: id});
        // the user select no device, disconnect.
        disconnectInputPort();
        clearStatus();
        setMidiInStatus(false);
        return false;
    }

    // do nothing if already connected to the selected device:
    if (p && (p.id === id)) {
        log(`connectInputDevice(${id}): port is already connected`);
        return false;
    }

    // log(`connectInputDevice(${id}): will connect port ${id}`);

    // save in settings for autoloading at next restart:
    saveSettings({input_device_id: id});

    // We only handle one connection, so we disconnected any connected port before connecting the new one.
    disconnectInputPort();

    // noinspection JSUnresolvedFunction
    const port = WebMidi.getInputById(id);
    if (port) {
        connectInputPort(port);

/*
        if ((MODEL.getPresetNumber() === 0) && getMidiInputPort() && getMidiOutputPort()) {
        // if (getMidiInputPort() && getMidiOutputPort()) {    //TODO: ask user (or set in pref) if we always request the current preset when connecting to the pedal
            //TODO: init from URL if sysex present ?
            setStatus("Request current preset");
            requestPreset();
        } else {
            setPresetDirty();
            appendMessage("Select a preset to sync the editor or use the Send command to sync the Enzo.", true);
        }
*/
        syncIfNoPreset();

        return true;

    } else {
        clearStatus();
        setStatusError(`Connect the Mercury7 or check the MIDI channel.`);
        setMidiInStatus(false);
    }

    return false;
}

//==================================================================================================================
// MIDI OUTPUT:

function connectOutputPort(output) {
    log("connectOutputPort");
    setMidiOutputPort(output);
    log(`%cconnectOutputPort: ${output.name} can now be used to send data on channel ${preferences.midi_channel}`, "color: orange; font-weight: bold");
    setStatus(`Output ${output.name} connected on MIDI channel ${preferences.midi_channel}.`);
    if (MODEL.getPresetNumber() !== 0) {
        // setPresetDirty();
        showPreset();
    }
}

function disconnectOutputPort() {
    const p = getMidiOutputPort();
    if (p) {
        log("disconnectOutputPort()");
        setMidiOutputPort(null);
        log("disconnectOutputPort: connectOutputPort: midi_output can not be used anymore");
        setStatus(`Output disconnected.`);
        if (MODEL.getPresetNumber() !== 0) {
            // setPresetDirty();
            showPreset();
        }
    }
}

/**
 *
 * @param id
 * @returns {boolean} true if new connection has been setup, otherwise false
 */
function connectOutputDevice(id) {

    log(`connectOutputDevice(${id})`, preferences.output_device_id);

    const p = getMidiOutputPort();

    if (!id && p) {
        log(`connectOutputDevice(): disconnect currently connected port`);
        // save in settings for autoloading at next restart:
        preferences.output_device_id = id;
        saveSettings();
        // the user select no device, disconnect.
        disconnectOutputPort();
        clearStatus();
        // setStatusError(`Please connect your device or check the MIDI channel.`);
        return false;
    }

    // do nothing if already connected to the selected device:
    if (p && (p.id === id)) {   //TODO: make as a function in midi_out.js
        log(`setOutputDevice(${id}): port is already connected`);
        return false;
    }

    // log(`%cconnectOutputDevice${id}): will use [${port.type} ${port.id} ${port.name}] as output`, "color: green; font-weight: bold");

    // save in settings for autoloading at next restart:
    saveSettings({output_device_id: id});

    // We only handle one connection, so we disconnected any connected port before connecting the new one.
    disconnectOutputPort();

    // noinspection JSUnresolvedFunction
    const port = WebMidi.getOutputById(id);
    if (port) {
        connectOutputPort(port);

/*
        if ((MODEL.getPresetNumber() === 0) && getMidiInputPort() && getMidiOutputPort()) {
        // if (getMidiInputPort() && getMidiOutputPort()) {     //TODO: ask user (or set in pref) if we always request the current preset when connecting to Enzo
            //TODO: init from URL if sysex present ?
            appendMessage("Request current preset");
            requestPreset();
        } else {
            setPresetDirty();
            appendMessage("Select a preset to sync the editor or use the Send command to sync the Enzo.", true);
        }
*/
        syncIfNoPreset();

        return true;

    } else {
        clearStatus();
        // setStatusError(`Please connect your device or check the MIDI channel.`);
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

    // log("%cdeviceConnected event", "color: yellow; font-weight: bold", info.port.id, info.port.type, info.port.name);
    if (TRACE) console.group("%cdeviceConnected event", "color: yellow; font-weight: bold", info.port.id, info.port.type, info.port.name);

    // Auto-connect if not already connected.

    //FIXME: use autoConnect() method

    // let new_connection = false;

    let input_connected = false;
    let output_connected = false;

    if (info.port.type === 'input') {
        if ((getMidiInputPort() === null) && (info.port.id === preferences.input_device_id)) {
            input_connected = connectInputDevice(preferences.input_device_id);
            // new_connection = true;
        } else {
            log("deviceConnected: input device ignored");
        }
    }

    if (info.port.type === 'output') {
        if ((getMidiOutputPort() === null) && (info.port.id === preferences.output_device_id)) {
            output_connected = connectOutputDevice(preferences.output_device_id);
            // new_connection = true;
        } else {
            log("deviceConnected: output device ignored");
        }
    }

    updateSelectDeviceList();

    // if (MODEL.getPresetNumber() === 0) new_connection = true;

    if (input_connected && output_connected && getMidiInputPort() && getMidiOutputPort()) {
        log("deviceConnected: we can sync", preferences.init_from_bookmark);

        // let initFromDevice = false;

        // if we have a hash sysex we ask the user if he want to initialize from the the hash or from the pedal
        if (hashSysexPresent() && preferences.init_from_bookmark === 1) {
            // if (window.confirm("Initialize from the bookmark sysex values?")) {
            // if (settings.init_from_bookmark) {
            //     initFromDevice = false;
                initFromBookmark();
            // } else {
            //     initFromDevice = true;
            // }
        } else {
            // initFromDevice = true;

            // setStatus("Init from device, request current preset");
            // requestPreset();

/*
            if (MODEL.getPresetNumber() === 0) {
                // if (getMidiInputPort() && getMidiOutputPort()) {    //TODO: ask user (or set in pref) if we always request the current preset when connecting to Enzo
                //TODO: init from URL if sysex present ?
                setStatus("Request current preset");
                requestPreset();
            } else {
                setPresetDirty();
                appendMessage("Select a preset to sync the editor or use the Send command to sync the Enzo.", true);
            }
*/

        }

        // if (initFromDevice) {
        //     setStatus("Request current preset");
        //     requestPreset();
        // }

    }

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
    updateSelectDeviceList();
}

//==================================================================================================================

/**
 * If no preset select (preset is 0) then read the preset from Mercury7, otherwise display a message to the user.
 * Do not call this method from
 */
function syncIfNoPreset() {

    if (getMidiInputPort() && getMidiOutputPort()) {
        if (MODEL.getPresetNumber() === 0) {
            // we wait 100ms before sending a read preset request because we, sometimes, receive 2 connect events. TODO: review connection events management
            setStatus("Request current preset in 200ms");
            log("syncIfNoPreset: will request preset in 200ms");
            window.setTimeout(requestPreset, 200);
        } else {
            setPresetDirty();
            appendMessage("Select a preset to sync the editor or use the Send command to sync the Mercury7.", true);
        }
    }

}

//==================================================================================================================
// Main

$(function () {

    log(`Mercury7 editor ${VERSION}`);

    loadSettings();

    // The documentElement is the "<html>" element for HTML documents.
    // if (settings.theme) document.documentElement.setAttribute('data-theme', settings.theme);
    // document.documentElement.setAttribute('data-theme', "gold");

    setupModel();
    setupUI(setMidiChannel, connectInputDevice, connectOutputDevice);

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
            initZoom(z);
        }
    }

    setupBookmarkSupport();
    startBookmarkAutomation();

    setStatus("Waiting for MIDI interface access...");

    // noinspection JSUnresolvedFunction
    WebMidi.enable(function (err) {

        if (err) {

            warn("webmidi err", err);

            appendMessage("ERROR: WebMidi could not be enabled.");
            appendMessage("-- PLEASE ENABLE MIDI IN YOUR BROWSER --");

            // Even we don't have MIDI available, we update at least the UI:
            initFromBookmark(false);

        } else {

            log("webmidi ok");

            setStatus("WebMidi enabled.");

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

            // autoConnect();
/*
            if (!initFromBookmark()) {  //TODO: ask the user if he wants to initialize from the hash or if he wants to get the pedal's current preset
                // requestPreset();
            }
*/

        }

    }, true);   // pass true to enable sysex support

});
