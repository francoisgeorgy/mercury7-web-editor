import MODEL from "./model";
import {log} from "./debug";
import {preferences} from "./preferences";
import {showMidiOutActivity} from "./ui_midi_activity";
import {logOutgoingMidiMessage} from "./ui_midi_window";
import {setPresetSelectorClean} from "./ui_presets";
import {appendMessage, monitorMessage} from "./ui_messages";
import {toHexString} from "./utils";
import {SYSEX_CMD} from "./model/constants";
import {control_id} from "./model/cc";
import {updateControls} from "./ui";
import {updateExpSlider} from "./ui_exp";
import {inExpMode} from "./ui_exp";
import {getMidiInputPort, suppressSysexEcho} from "./midi_in";
import {updateImportPresetsProgress} from "./preset_library";
import {SYSEX_START_BYTE} from "./model/sysex";

const wait = ms => new Promise(r => setTimeout(r, ms));

let midi_output = null;

export function getMidiOutputPort() {
    return midi_output;
}

export function setMidiOutputPort(port) {
    midi_output = port;
    if (port) {
        log(`setMidiOutputPort: midi_output assigned to "${port.name}"`);
    } else {
        log("setMidiOutputPort: midi_output set to null");
    }
}


// const previous_values = new Array(127);
const monitors = new Array(127);

/*
function updatePreviousValues() {
    const c = MODEL.control;
    for (let i=0; i < c.length; i++) {
        if (typeof c[i] === "undefined") continue;
        previous_values[i] = c.raw_value;
    }
}
*/

function monitorCC(control_number) {
    clearTimeout(monitors[control_number]);
    monitors[control_number] = setTimeout(() => {
        const v = MODEL.control[control_number].raw_value;
        log(`monitor send CC ${control_number} = ${v}`);
        monitorMessage(control_number, v);
    }, 200)
}


let last_send_time = performance.now();     // for echo suppression

export function getLastSendTime() {
    return last_send_time;
}

/**
 * Send a control value to the connected device.
 * @param control
 * @param monitor
 */
export function sendCC(control, monitor = true) {

    if (monitor) monitorCC(control.cc_number);   // TODO: check that control exists

    // If we edit the EXP value then we send value2

    const v = inExpMode() ? MODEL.getControlValueExp(control) : MODEL.getControlValue(control);

    if (midi_output) {
        log(`send CC ${control.cc_number} ${v} (${control.name}) on channel ${preferences.midi_channel}`);

        showMidiOutActivity();

        last_send_time = performance.now(); // for echo suppression

        midi_output.sendControlChange(control.cc_number, v, preferences.midi_channel);

    } else {
        log(`(send CC ${control.cc_number} ${v} (${control.name}) on channel ${preferences.midi_channel})`);
    }

    logOutgoingMidiMessage("CC", [control.cc_number, v]);

}

/**
 * Update the connected device.
 * Note: jQuery Knob transmits the value as a float
 *
 * Called by the onChange handlers of dials, switches and selects.
 *
 * @param control_type
 * @param control_number
 * @param value_float
 * @param in_exp_mode
 */
export function updateDevice(control_type, control_number, value_float, in_exp_mode = false) {

    let value = Math.round(value_float);

    log("updateDevice", control_type, control_number, value_float, value);

    sendCC(MODEL.setControlValue(control_type, control_number, value, in_exp_mode));

    // EXP
    if (control_number === control_id.exp_pedal) {   //TODO: must be done when receiving CC 4 too
        log("updateDevice: control is EXP, interpolate and update");
        MODEL.interpolateExpValues(value);
        updateExpSlider(value);
        updateControls(true);
    }
}

// let fullUpdateRunning = false;

/**
 * Send all values to the connected device
 * Wait 40ms between each CC
 */
export function fullUpdateDevice() {

    log(`fullUpdateDevice()`);

    // if (!getMidiInputPort() || !getMidiOutputPort()) {
    //     appendMessage(`--- PLEASE CONNECT THE ${MODEL.name.toUpperCase()} ---`);
    //     // setPresetDirty();    //FIXME: why call setPresetDirty here?
    // }

    sendSysex(MODEL.getPreset(false));

    return false;   // if used in a href onclick
}

function sendPC(number) {

    if (midi_output) {
        log(`send program change ${number}`);

        showMidiOutActivity();

        last_send_time = performance.now(); // for echo suppression

        midi_output.sendProgramChange(number, preferences.midi_channel);

        // appendMessage(`Preset ${number} selected.`);

        // if (!getMidiInputPort()) {
        //     appendMessage("Unable to receive the preset from the pedal.");
        // }

    } else {
        appendMessage(`Unable to send the PC command to the pedal.`);
        log(`(send program change ${number})`);
    }
}

/**
 * 1. Send a PC command
 * 2. Wait 50 ms
 * 3. Read the preset (send sysex read preset command)
 * @param number
 */
export function setAndSendPC(number) {

    log(`setAndSendPC(${number})`);

    // setPresetNumber(pc);
    // appendMessage(`Preset ${pc} selected.`);

    MODEL.meta.preset_id.value = number;

    sendPC(number);
/*
    if (midi_output) {
        log(`send program change ${pc}`);

        showMidiOutActivity();

        last_send_time = performance.now(); // for echo suppression

        midi_output.sendProgramChange(pc, preferences.midi_channel);

        appendMessage(`Preset ${pc} selected.`);

        if (!getMidiInputPort()) {
            appendMessage("Unable to receive the preset from the pedal.");
        }

    } else {
        appendMessage(`Unable to send the PC command to the pedal.`);
        log(`(send program change ${pc})`);
    }
*/
    appendMessage(`Preset ${number} selected.`);

    if (!getMidiInputPort() || !getMidiOutputPort()) {
        appendMessage(`--- PLEASE CONNECT THE ${MODEL.name.toUpperCase()} ---`);
    }

    logOutgoingMidiMessage("PC", [number]);
    setTimeout(() => requestPreset(true), 50);  // we wait 50 ms before requesting the preset

    //TODO: after having received the preset, set BYPASS to 127 (ON)

}

export function sendSysex(data) {
    if (midi_output) {
        log(`%csendSysex: ${data.length} bytes: ${toHexString(data, ' ')}`, "color:red;font-weight:bold");

        let dataArray;
        if (data[0] === SYSEX_START_BYTE) {
            dataArray = Array.from(data).slice(1 + MODEL.meta.signature.sysex.value.length, -1);
        } else {
            dataArray = Array.from(data);
        }

        showMidiOutActivity();
        suppressSysexEcho(data);
        midi_output.sendSysex(MODEL.meta.signature.sysex.value, dataArray);

        // setPresetClean();
    } else {
        log(`%c(sendSysex: ${data.length} bytes: ${toHexString(data, ' ')})`, "color:red;font-weight:bold");
        appendMessage(`--- PLEASE CONNECT THE ${MODEL.name.toUpperCase()} ---`);
    }
    logOutgoingMidiMessage("SysEx", data);
}

function sendSysexCommand(command) {
    log(`sendSysexCommand(${toHexString(command, ' ')})`);
    sendSysex([MODEL.meta.device_id.value, MODEL.meta.group_id.value, MODEL.meta.model_id.value, command]);
}

export function requestPreset(check = false) {
    log("requestPreset");
    if (check) checkPresetReceived();
    sendSysexCommand(SYSEX_CMD.preset_request);
    return false;   // if used in a href onclick
}

export function savePreset() {
    log("savePreset");
    sendSysexCommand(SYSEX_CMD.preset_write);
    // cleanPreset();
    setPresetSelectorClean();
}

export function requestGlobalSettings() {
    log("requestGlobalSettings");
    sendSysexCommand(SYSEX_CMD.globals_request);
}

export async function writePreset(number, data) {
    log("writePreset");
    sendPC(number);
    await wait(50);
    sendSysex(data);
    await wait(100);
    sendSysexCommand(SYSEX_CMD.preset_write);
    await wait(100);
}

/*
    typical timings:

    08:29:12.802	To Scarlett 18i20 USB	Program	2	2
    08:29:12.805	From Scarlett 18i20 USB	Program	2	2
    08:29:12.853	To Scarlett 18i20 USB	SysEx		Micon Audio Electronics 9 bytes	F0 00 20 10 01 01 03 25 F7
    08:29:12.872	From Scarlett 18i20 USB	SysEx		Micon Audio Electronics 26 bytes	F0 00 20 10 01 01 03 26 02 7F 7F 79 2A 00 3F 41 00 00 00 00 00 7F 7F 7F 00 F7
    08:29:12.880	From Scarlett 18i20 USB	SysEx		Micon Audio Electronics 9 bytes	F0 00 20 10 01 01 03 25 F7
    08:29:12.953	To Scarlett 18i20 USB	Program	2	3
    08:29:12.958	From Scarlett 18i20 USB	Program	2	3
    08:29:13.008	To Scarlett 18i20 USB	SysEx		Micon Audio Electronics 9 bytes	F0 00 20 10 01 01 03 25 F7
    08:29:13.026	From Scarlett 18i20 USB	SysEx		Micon Audio Electronics 39 bytes	F0 00 20 10 01 01 03 26 03 40 6A 7F 7F 00 1C 00 00 34 00 00 57 7F 00 5F 7F 16 00 7B 7F 7F 3F 00…
    08:29:13.038	From Scarlett 18i20 USB	SysEx		Micon Audio Electronics 9 bytes	F0 00 20 10 01 01 03 25 F7
*/

let fullReadInProgress = false;
let autoLockOnImport = false;

export function isFullReadInProgress() {
    return fullReadInProgress;
}

export function setAutoLockOnImport(b) {
    autoLockOnImport = b;
}

export function isAutoLockOnImport() {
    return autoLockOnImport;
}

export async function requestAllPresets() {

    const FROM = 1;
    const TO = 16;

    log("requestAllPresets");

    if (!midi_output) {
        return;
    }

    fullReadInProgress = true;

    for (let i=FROM; i<=TO; i++) {
        log(`requestAllPresets: PC ${i}`);
        updateImportPresetsProgress(FROM, TO, i);
        midi_output.sendProgramChange(i, preferences.midi_channel);
        await wait(50);
        requestPreset()
        await wait(200);
    }

    wasPresetReceived();

    log("requestAllPresets done");
    fullReadInProgress = false;
}

//=============================================================================
// This is a kind of communication check. We use the result to set the
// background color of the preset selector.

let presetReceived = false;

export function isCommOk() {
    return presetReceived;
}

export function confirmPresetReceived() {
    log('confirmPresetReceived: set presetReceived=true');
    presetReceived = true;
}

function wasPresetReceived() {
    log('wasPresetReceived?', presetReceived);
    if (presetReceived) {
        $('.preset').addClass("comm-ok");
    } else {
        $('.preset').removeClass("comm-ok");
    }
}

/**
 * Set a timer to check if a preset was received as expected
 */
function checkPresetReceived() {
    presetReceived = false;
    // after 200 ms we check that we have received the preset
    setTimeout(() => wasPresetReceived(), 200);
}


