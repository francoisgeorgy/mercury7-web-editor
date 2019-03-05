
//
// Popup to display MIDI messages
//
import {toHexString} from "./utils";

let midi_window = null;

/**
 *
 * @returns {boolean}
 */
export function openMidiWindow() {
    midi_window = window.open("midi.html", "_midi", "location=no,height=600,width=400,scrollbars=yes,status=no");
    return false;   // disable the normal href behavior
}

//
// Count the number of messages displayed in the MIDI window.
//
let midi_in_messages = 0;
let midi_out_messages = 0;

/**
 *
 * @param type
 * @param control
 * @param value
 */
export function logIncomingMidiMessage(type, data) {
    if (midi_window) {
        // const ctrl = parseInt(control);
        // const v = parseInt(value);
        midi_in_messages++;
        // log at max 1000 messages:
        if (midi_in_messages > 1000) $("#midi-messages-in div:last-child", midi_window.document).remove();
        let s = type + " " + toHexString(data, " ");
            // ctrl.toString(10).padStart(3, "0") + " " +
            // v.toString(10).padStart(3, "0") + " (" +
            // ctrl.toString(16).padStart(2, "0") + " " +
            // v.toString(16).padStart(2, "0") + ")";
        $("#midi-messages-in", midi_window.document).prepend(`<div>${s.toUpperCase()}</div>`);
    }
}

/**
 *
 * @param type
 * @param control
 * @param value
 */
export function logOutgoingMidiMessage(type, data) {
    if (midi_window) {
        if (!type) return;
        // const ctrl = parseInt(control);
        // const v = parseInt(value);
        midi_out_messages++;
        // log at max 1000 messages:
        if (midi_out_messages > 1000) $("#midi-messages-out div:last-child", midi_window.document).remove();
        let s = "";
        switch (type.toUpperCase()) {
            case "CC":
                s = type + " " + toHexString(data, " ");
                    // ctrl.toString(10).padStart(3, "0") + " " +
                    // v.toString(10).padStart(3, "0") + " (" +
                    // ctrl.toString(16).padStart(2, "0") + " " +
                    // v.toString(16).padStart(2, "0") + ")";
                break;
            case "PC":
                s = type + " " + toHexString(data, " ");
                    // ctrl.toString(10).padStart(3, "0") + " " +
                    // ctrl.toString(16).padStart(2, "0");
                break;
            case "SYSEX":
                s = type + " " + toHexString(data, ' ');
                    // ctrl.toString(10).padStart(3, "0") + " " +
                    // ctrl.toString(16).padStart(2, "0");
                break;
            default:
                s = "unknown message";
        }
        $("#midi-messages-out", midi_window.document).prepend(`<div>${s.toUpperCase()}</div>`);
    }
}
