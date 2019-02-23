import MODEL from "./model";
import {log, TRACE} from "./debug";
import {settings} from "./settings";
import {showMidiOutActivity} from "./ui_midi_activity";
import {logOutgoingMidiMessage} from "./ui_midi_window";
import {setPresetNumber} from "./ui_presets";
import {appendMessage, monitorMessage, MSG_SEND_SYSEX, setStatus} from "./ui_messages";
import {toHexString} from "./utils";
import {setSuppressSysexEcho} from "./midi_in";

let midi_output = null;

export function getMidiOutputPort() {
    return midi_output;
}

export function setMidiOutputPort(port) {
    midi_output = port;
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
 */
export function sendCC(control) {

    monitorCC(control.cc_number);   // TODO: check that control exists

    const v = MODEL.getControlValue(control);

    if (midi_output) {
        log(`send CC ${control.cc_number} ${v} (${control.name}) on MIDI channel ${settings.midi_channel}`);

        showMidiOutActivity();

        last_send_time = performance.now(); // for echo suppression

        midi_output.sendControlChange(control.cc_number, v, settings.midi_channel);

    } else {
        log(`(send CC ${control.cc_number} ${v} (${control.name}) on MIDI channel ${settings.midi_channel})`);
    }

    logOutgoingMidiMessage("CC", control.cc_number, v);

    /*
        let a = MODEL.getMidiMessagesForCC(control);

        for (let i=0; i<a.length; i++) {
            if (midi_output) {
                log(`send CC ${a[i][0]} ${a[i][1]} (${control.name}) on MIDI channel ${settings.midi_channel}`);
                showMidiOutActivity();
                last_send_time = performance.now(); // for echo suppression

                midi_output.sendControlChange(a[i][0], a[i][1], settings.midi_channel);

            } else {
                log(`(send CC ${a[i][0]} ${a[i][1]} (${control.name}) on MIDI channel ${settings.midi_channel})`);
            }
            logOutgoingMidiMessage("CC", a[i][0], a[i][1]);
        }
    */
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
 */
export function updateDevice(control_type, control_number, value_float) {

    let value = Math.round(value_float);

    log("updateDevice", control_type, control_number, value_float, value);

    sendCC(MODEL.setControlValue(control_type, control_number, value));
}

/**
 * Send all values to the connected device
 */
export function fullUpdateDevice(onlyChanged = false) {
    if (TRACE) console.groupCollapsed(`fullUpdateDevice(${onlyChanged})`);
    const c = MODEL.control;
    for (let i=0; i < c.length; i++) {
        if (typeof c[i] === "undefined") continue;
        if (!onlyChanged || c[i].randomized) {
            sendCC(c[i]);
            c[i].randomized = false;
        }
    }
    if (TRACE) console.groupEnd();
}

export function sendPC(pc) {

    setPresetNumber(pc);

    appendMessage(`Select preset ${pc}`);

    MODEL.meta.preset_id.value = pc;

    if (midi_output) {
        log(`send program change ${pc}`);
        showMidiOutActivity();

        midi_output.sendProgramChange(pc, settings.midi_channel);

        appendMessage(MSG_SEND_SYSEX);
    }
    logOutgoingMidiMessage("PC", pc);
}

export function sendSysEx(data) {
    log("sendSysEx", toHexString(data, ' '), data);
    if (midi_output) {
        showMidiOutActivity();
        setSuppressSysexEcho();
        midi_output.sendSysex(MODEL.meta.signature.sysex.value, Array.from(data));
    }
    logOutgoingMidiMessage("SysEx", 0);
}
