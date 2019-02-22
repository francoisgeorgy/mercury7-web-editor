import {log, TRACE, warn} from "./debug";
import * as WebMidi from "webmidi";
import {detect} from "detect-browser";
import {VERSION} from "./constants";
import {loadSettings, saveSettings, settings} from "./settings";
import {clearError, clearStatus, MSG_SEND_SYSEX, setMidiInStatus, setStatus, setStatusError} from "./ui_messages";
import {setupUI} from "./ui";
import {updateSelectDeviceList} from "./ui_selects";
import {getMidiInputPort, handleCC, handlePC, handleSysex, setMidiInputPort} from "./midi_in";
import {getMidiOutputPort, setMidiOutputPort} from "./midi_out";
import {initFromBookmark, setupBookmarkSupport} from "./hash";
import "./css/themes.css";
import "./css/main.css";
import "./css/zoom.css";
import "./css/grid-default.css";
import "./css/grid-global-settings.css";
import "./css/grid-app-preferences.css";
import "./css/knob.css";
import "./css/lity.min.css";

const browser = detect();

if (browser) {
    log(browser.name);
    log(browser.version);
    switch (browser && browser.name) {
        case "chrome":
            log("supported browser");
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

function setMidiChannel(midi_channel) {

    // Note: output does not use any event listener, so there's nothing to update on the output device when we only
    //       change the MIDI channel.

    log(`setMidiChannel(${midi_channel}): disconnect input`);
    disconnectInputPort();

    // Set new channel:
    log(`setMidiChannel(${midi_channel}): set new channel`);
    saveSettings({midi_channel});

    log(`setMidiChannel(${midi_channel}): reconnect input ${settings.input_device_id}`);
    connectInputDevice(settings.input_device_id);
}

//==================================================================================================================
// WebMidi events handling

function disconnectInputPort() {
    log("disconnectInput()");
    const p = getMidiInputPort();
    if (p) {
        p.removeListener();    // remove all listeners for all channels
        setMidiInputPort(null);
        log("midi_input not listening");
    }
    setMidiInStatus(false);
    setStatus(`Device is disconnected.`);
}

function connectInputPort(input) {

    log("connectInput()");

    if (!input) return;

    setMidiInputPort(input);
    log(`midi_input assigned to "${input.name}"`);

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

    log(`${input.name} listening on channel ${settings.midi_channel}`);
    setMidiInStatus(true);
    clearError();
    setStatus(`${input.name} connected on MIDI channel ${settings.midi_channel}.`, MSG_SEND_SYSEX);

}

function disconnectOutputPort() {
    log("disconnectOutput()");
    setMidiOutputPort(null);
}

function connectOutputPort(output) {
    log("connect output");
    setMidiOutputPort(output);
    log(`midi_output assigned to "${output.name}"`);
}

function connectInputDevice(id) {

    log(`connectInputDevice(${id})`);

    const p = getMidiInputPort();

    if (!id && p) {
        // save in settings for autoloading at next restart:
        saveSettings({input_device_id: id});
        // the user select no device, disconnect.
        disconnectInputPort();
        clearStatus();
        setStatusError(`Please connect your device or check the MIDI channel.`);
        setMidiInStatus(false);
        return;
    }

    // do nothing if already connected to the selected device:
    if (p && (p.id === id)) {
        log(`connectInputDevice(${id}): port is already connected`);
        return;
    }

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
        setStatusError(`Please connect your device or check the MIDI channel.`);
        setMidiInStatus(false);
    }
}

function connectOutputDevice(id) {

    log(`connectOutputDevice(${id})`);

    const p = getMidiOutputPort();

    if (!id && p) {
        // save in settings for autoloading at next restart:
        settings.output_device_id = id;
        saveSettings();
        // the user select no device, disconnect.
        disconnectOutputPort();
        clearStatus();
        setStatusError(`Please connect your device or check the MIDI channel.`);
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
        setStatusError(`Please connect your device or check the MIDI channel.`);
    }
}

/**
 *
 * @param info
 */
function deviceConnected(info) {
    log("%cdeviceConnected", "color: yellow; font-weight: bold", info.type, info.port.type, info.port.id, info.port.name);

    // Auto-connect if not already connected.
    if (getMidiInputPort() === null) connectInputDevice(settings.input_device_id);
    if (getMidiOutputPort() === null) connectOutputDevice(settings.output_device_id);

    updateSelectDeviceList();
}

/**
 *
 * @param info
 */
function deviceDisconnected(info) {
    log("%cdeviceDisconnected", "color: orange; font-weight: bold", info.type, info.port.type, info.port.id, info.port.name);

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

function autoConnect() {
    if (settings) {
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
    document.documentElement.setAttribute('data-theme', "blue");

    setupUI(setMidiChannel, connectInputDevice, connectOutputDevice);
    setupBookmarkSupport();
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
                WebMidi.inputs.map(i => console.log("available input: ", i));
                // noinspection JSUnresolvedVariable
                WebMidi.outputs.map(i => console.log("available output: ", i));
            }

            // noinspection JSUnresolvedFunction
            WebMidi.addListener("connected", e => deviceConnected(e));
            // noinspection JSUnresolvedFunction
            WebMidi.addListener("disconnected", e => deviceDisconnected(e));

            autoConnect();
            initFromBookmark();

        }

    }, true);   // pass true to enable sysex support

});
