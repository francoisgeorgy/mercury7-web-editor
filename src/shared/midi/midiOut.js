import MODEL from "@model";
import {SYSEX_CMD, SYSEX_START_BYTE} from "@model/sysex";
import {log} from "@utils/debug";
import {preferences} from "@shared/preferences";
import {showMidiOutActivity} from "@midi/midiActivity";
import {logOutgoingMidiMessage} from "@midi/midiWindow";
import {setPresetSelectorClean} from "@shared/presets";
import {toHexString} from "@utils";
import {updateExpSlider} from "@shared/expController";
import {inExpMode} from "@shared/expController";
import {suppressSysexEcho} from "@midi/midiIn";
import {updateImportPresetsProgress} from "@shared/preset_library";
import {updateControls} from "@shared/controller";
import {customUpdateUI} from "@device/controller";

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
// const monitors = new Array(127);

/*
function updatePreviousValues() {
    const c = MODEL.control;
    for (let i=0; i < c.length; i++) {
        if (typeof c[i] === "undefined") continue;
        previous_values[i] = c.raw_value;
    }
}
*/

/*
function monitorCC(control_number) {
    clearTimeout(monitors[control_number]);
    monitors[control_number] = setTimeout(() => {
        const v = MODEL.control[control_number].raw_value;
        log(`monitor send CC ${control_number} = ${v}`);
    }, 200)
}
*/


let last_send_time = performance.now();     // for echo suppression

export function getLastSendTime() {
    return last_send_time;
}

/**
 * Send a control value to the connected device.
 * @param control
 */
// export function sendCC(control, monitor = true) {
export function sendCC(control) {

    // if (monitor) monitorCC(control.cc_number);   // TODO: check that control exists

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
    if (control_number === MODEL.control_id.exp_pedal) {   //TODO: must be done when receiving CC 4 too
        log("updateDevice: control is EXP, interpolate and update");
        MODEL.interpolateExpValues(value);
        updateExpSlider(value);
        updateControls(true);
    }

    customUpdateUI(control_type, control_number);
}

// let fullUpdateRunning = false;

/**
 * Send all values to the connected device
 * Wait 40ms between each CC
 */
export function fullUpdateDevice() {

    log(`fullUpdateDevice()`);

    sendSysex(MODEL.getPreset(false));

    return false;   // if used in a href onclick
}

function sendPC(number) {

    if (midi_output) {
        log(`send program change ${number}`);

        showMidiOutActivity();

        last_send_time = performance.now(); // for echo suppression

        midi_output.sendProgramChange(number, preferences.midi_channel);

    } else {
        // appendMessage(`Unable to send the PC command to the pedal.`);
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

    MODEL.meta.preset_id.value = number;

    sendPC(number);

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

    // } else {
    //     log(`%c(sendSysex: ${data.length} bytes: ${toHexString(data, ' ')})`, "color:red;font-weight:bold");
        // appendMessage(`--- PLEASE CONNECT THE ${MODEL.name.toUpperCase()} ---`);
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
    if (!window.confirm(`Save current preset in device memory slot #${MODEL.getPresetNumber()} ?`)) return;
    sendSysexCommand(SYSEX_CMD.preset_write);
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
