import {toHexString} from "@utils";

// Popup to display MIDI messages
let midi_window = null;

// Count the number of messages displayed in the MIDI window.
let midi_in_messages = 0;
let midi_out_messages = 0;

/**
 *
 * @param type
 * @param data
 */
export function logOutgoingMidiMessage(type, data) {
    if (midi_window) {
        if (!type) return;
        midi_out_messages++;
        // log at max 1000 messages:
        if (midi_out_messages > 1000) $("#midi-messages-out div:last-child", midi_window.document).remove();
        let s;
        switch (type.toUpperCase()) {
            case "CC":
                s = type + " " + toHexString(data, " ");
                break;
            case "PC":
                s = type + " " + toHexString(data, " ");
                break;
            case "SYSEX":
                s = type + " " + toHexString(data, ' ');
                break;
            default:
                s = "unknown message";
        }
        $("#midi-messages-out", midi_window.document).prepend(`<div>${s.toUpperCase()}</div>`);
    }
}
