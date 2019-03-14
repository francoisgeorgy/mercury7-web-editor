import MODEL from "./model";
import {log} from "./debug";
import {preferences} from "./preferences";
import {showMidiOutActivity} from "./ui_midi_activity";
import {logOutgoingMidiMessage} from "./ui_midi_window";
import {setPresetClean, setPresetDirty} from "./ui_presets";
import {appendMessage, monitorMessage} from "./ui_messages";
import {toHexString} from "./utils";
import {GROUP_ID, MODEL_ID, SYSEX_CMD} from "./model/constants";
import {control_id} from "./model/cc";
import {updateControls} from "./ui";
import {updateExpSlider} from "./ui_sliders";
import {inExpMode} from "./exp";
import {getMidiInputPort, suppressSysexEcho} from "./midi_in";

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
        log(`send CC ${control.cc_number} ${v} (${control.name}) on MIDI channel ${preferences.midi_channel}`);

        showMidiOutActivity();

        last_send_time = performance.now(); // for echo suppression

        midi_output.sendControlChange(control.cc_number, v, preferences.midi_channel);

    } else {
        log(`(send CC ${control.cc_number} ${v} (${control.name}) on MIDI channel ${preferences.midi_channel})`);
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
export function fullUpdateDevice(onlyChanged = false /*, silent = false*/) {

    log(`fullUpdateDevice(${onlyChanged})`);
/*
    if (fullUpdateRunning) return;

    fullUpdateRunning = true;

    const c = MODEL.control;

    let i = -1;
    function f() {
        i = i + 1;
        // skip undefined entries:
        while (i < c.length && typeof c[i] === "undefined") {
            i = i + 1;
        }
        if (i >= c.length) {
            log(`fullUpdateDevice done`);
            fullUpdateRunning = false;
            if (!silent && midi_output) {
                appendMessage("Current settings sent to Mercury7.")
            }
        } else {
            // log(`fullUpdateDevice: send CC ${i}`);
            if (!onlyChanged) {
                sendCC(c[i], false);
            }
            setTimeout(f, 40);
        }
    }

    f();
*/
    sendSysex(MODEL.getPreset(false));

    if (!getMidiInputPort() || !getMidiOutputPort()) {
        appendMessage("--- PLEASE CONNECT THE ENZO ---");
        setPresetDirty();
    } else {
        setPresetClean();
    }

}

/**
 * 1. Send a PC command
 * 2. Wait 50 ms
 * 3. Read the preset (send sysex read preset command)
 * @param pc
 */
export function sendPC(pc) {
    // setPresetNumber(pc);
    // appendMessage(`Preset ${pc} selected.`);

    MODEL.meta.preset_id.value = pc;
    if (midi_output) {
        log(`send program change ${pc}`);
        showMidiOutActivity();
        midi_output.sendProgramChange(pc, preferences.midi_channel);

        appendMessage(`Preset ${pc} selected.`);

        if (!getMidiInputPort()) {
            appendMessage("Unable to receive the preset from Enzo.");
        }

    } else {
        appendMessage(`Unable to send the PC command to Enzo.`);
        log(`(send program change ${pc})`);
    }

    if (!getMidiInputPort() || !getMidiOutputPort()) {
        appendMessage("--- PLEASE CONNECT THE ENZO ---");
        setPresetDirty();
    }

    logOutgoingMidiMessage("PC", [pc]);
    setTimeout(() => requestPreset(), 50);  // we wait 50 ms before requesting the preset
}

export function sendSysex(data) {
    if (midi_output) {
        log(`%csendSysex: ${data.length} bytes: ${toHexString(data, ' ')}`, "color:red;font-weight:bold");
        showMidiOutActivity();
        suppressSysexEcho(data);
        midi_output.sendSysex(MODEL.meta.signature.sysex.value, Array.from(data));

        // setPresetClean();
    } else {
        log(`%c(sendSysex: ${data.length} bytes: ${toHexString(data, ' ')})`, "color:red;font-weight:bold");

        appendMessage("--- PLEASE CONNECT THE ENZO ---");
        // setPresetDirty();
    }
    logOutgoingMidiMessage("SysEx", data);
}

function sendSysexCommand(command) {
    log(`sendSysexCommand(${toHexString(command, ' ')})`);
    sendSysex([0x00, GROUP_ID.pedal, MODEL_ID.enzo, command]);
}

export function requestPreset() {
    log("requestPreset");
    sendSysexCommand(SYSEX_CMD.preset_request);
}

export function savePreset() {
    log("savePreset");
    sendSysexCommand(SYSEX_CMD.preset_write);
    // cleanPreset();
    setPresetClean();
}

export function requestGlobalSettings() {
    log("requestGlobalSettings");
    sendSysexCommand(SYSEX_CMD.globals_request);
}



