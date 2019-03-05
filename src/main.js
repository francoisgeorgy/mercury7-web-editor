import {log, TRACE, warn} from "./debug";
import * as WebMidi from "webmidi";
import MODEL from "./model";
import {detect} from "detect-browser";
import {VERSION} from "./constants";
import {loadSettings, saveSettings, settings} from "./settings";
import {
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
import {hashSysexPresent, initFromBookmark, setupBookmarkSupport, startBookmarkAutomation} from "./hash";
import "./css/lity.min.css";    // order important
import "./css/themes.css";
import "./css/main.css";
import "./css/zoom.css";
import "./css/grid-default.css";
import "./css/grid-global-settings.css";
import "./css/grid-app-preferences.css";

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
    MODEL.setDeviceId(settings.midi_channel);   // the device_id is the midi channel
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
    saveSettings({midi_channel});

    MODEL.setDeviceId(settings.midi_channel);

    log(`setMidiChannel(${midi_channel}): reconnect input ${settings.input_device_id}`);
    connectInputDevice(settings.input_device_id);
}

//==================================================================================================================
// WebMidi events handling

function connectInputPort(input) {

    log(`connectInputPort(${input.id})`);

    if (!input) return;

    setMidiInputPort(input);

    input
        .on("programchange", settings.midi_channel, function(e) {
            handlePC(e.data);
        })
        .on("controlchange", settings.midi_channel, function(e) {
            handleCC(e.data);
        })
        .on("sysex", settings.midi_channel, function(e) {
            handleSysex(e.data);
        });

    log(`%cconnectInputPort: ${input.name} is now listening on channel ${settings.midi_channel}`, "color: orange; font-weight: bold");
    setMidiInStatus(true);
    clearError();
    // setStatus(`${input.name} connected on MIDI channel ${settings.midi_channel}.`, MSG_SEND_SYSEX);
    setStatus(`${input.name} connected on MIDI channel ${settings.midi_channel}.`);
}

function disconnectInputPort() {
    const p = getMidiInputPort();
    if (p) {
        log("disconnectInputPort()");
        p.removeListener();    // remove all listeners for all channels
        setMidiInputPort(null);
        log("disconnectInputPort: midi_input does not listen anymore");
        setStatus(`Device is disconnected.`);
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
        setStatusError(`Connect the Mercury7 or check the MIDI channel.`);
        setMidiInStatus(false);
        return;
    }

    // do nothing if already connected to the selected device:
    if (p && (p.id === id)) {
        log(`connectInputDevice(${id}): port is already connected`);
        return;
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
    } else {
        clearStatus();
        setStatusError(`Connect the Mercury7  or check the MIDI channel.`);
        setMidiInStatus(false);
    }
}

//==================================================================================================================
// MIDI OUTPUT:

function connectOutputPort(output) {
    log("connectOutputPort");
    setMidiOutputPort(output);
    log(`%cconnectOutputPort: ${output.name} can no be use to send data on channel ${settings.midi_channel}`, "color: orange; font-weight: bold");
}

function disconnectOutputPort() {
    const p = getMidiOutputPort();  // we check the current output_port only for print better log messages
    if (p) {
        log("disconnectOutputPort()");
        setMidiOutputPort(null);
        log("disconnectOutputPort: connectOutputPort: midi_output can not be use anymore");
    }
}

function connectOutputDevice(id) {

    log(`connectOutputDevice(${id})`, settings.output_device_id);

    const p = getMidiOutputPort();

    if (!id && p) {
        log(`connectOutputDevice(): disconnect currently connected port`);
        // save in settings for autoloading at next restart:
        settings.output_device_id = id;
        saveSettings();
        // the user select no device, disconnect.
        disconnectOutputPort();
        clearStatus();
        // setStatusError(`Please connect your device or check the MIDI channel.`);
        return;
    }

    // do nothing if already connected to the selected device:
    if (p && (p.id === id)) {   //TODO: make as a function in midi_out.js
        log(`setOutputDevice(${id}): port is already connected`);
        return;
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
    } else {
        clearStatus();
        // setStatusError(`Please connect your device or check the MIDI channel.`);
    }
}

//==================================================================================================================

/**
 * The is the event handler for the "device connected" event.
 * If we have a prefered device set in settings AND if there is no device connected yet and if the saved device corresponds
 * to the event's device, then we connect it. Otherwise we just update the device list.
 * @param info
 */
function deviceConnected(info) {

    // log("%cdeviceConnected event", "color: yellow; font-weight: bold", info.port.id, info.port.type, info.port.name);
    if (TRACE) console.group("%cdeviceConnected event", "color: yellow; font-weight: bold", info.port.id, info.port.type, info.port.name);

    // Auto-connect if not already connected.

    //FIXME: use autoConnect() method

    let new_connection = false;

    if (info.port.type === 'input') {
        if ((getMidiInputPort() === null) && (info.port.id === settings.input_device_id)) {
            connectInputDevice(settings.input_device_id);
            new_connection = true;
        } else {
            log("deviceConnected: input device ignored");
        }
    }

    if (info.port.type === 'output') {
        if ((getMidiOutputPort() === null) && (info.port.id === settings.output_device_id)) {
            connectOutputDevice(settings.output_device_id);
            new_connection = true;
        } else {
            log("deviceConnected: output device ignored");
        }
    }

    updateSelectDeviceList();

    if (new_connection && getMidiInputPort() && getMidiOutputPort()) {

        log("deviceConnected: we can sync", settings.init_from_bookmark);

        // let initFromDevice = false;

        // if we have a hash sysex we ask the user if he want to initialize from the the hash or from the pedal
        if (hashSysexPresent() && settings.init_from_bookmark === 1) {
            // if (window.confirm("Initialize from the bookmark sysex values?")) {
            // if (settings.init_from_bookmark) {
            //     initFromDevice = false;
                initFromBookmark();
            // } else {
            //     initFromDevice = true;
            // }
        } else {
            // initFromDevice = true;
            setStatus("Request current preset");
            requestPreset();
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

function autoConnect() {
    if (settings) {
        log(`autoConnect()`);
        //AUTO CONNECT
        connectInputDevice(settings.input_device_id);
        connectOutputDevice(settings.output_device_id);
        updateSelectDeviceList();
    }
}

//==================================================================================================================
// Main

$(function () {

    log(`Mercury7 Web Interface ${VERSION}`);

    loadSettings();

    // The documentElement is the "<html>" element for HTML documents.
    // if (settings.theme) document.documentElement.setAttribute('data-theme', settings.theme);
    // document.documentElement.setAttribute('data-theme', "blue");

    setupModel();
    setupUI(setMidiChannel, connectInputDevice, connectOutputDevice);
    setupBookmarkSupport();
    startBookmarkAutomation();

    setStatus("Waiting for MIDI interface access...");

    // noinspection JSUnresolvedFunction
    WebMidi.enable(function (err) {

        if (err) {

            warn("webmidi err", err);

            setStatusError("ERROR: WebMidi could not be enabled.");

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
            if (!initFromBookmark()) {  //TODO: ask the user if he wants to initilize from the hash or if he wants to get the pedal's current preset
                // requestPreset();
            }
*/

        }

    }, true);   // pass true to enable sysex support

});
