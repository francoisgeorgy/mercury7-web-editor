import {warn} from "./debug";
import MODEL from "./model";

/**
 * Makes the app name glows when we have both a input device and an output device selected.
 * TODO: check that the devices are of the right type.
 * @param status
 */
export function setCommunicationStatus(status) {
    if (status) {
        $(".neon").addClass("glow");
    } else {
        $(".neon").removeClass("glow");
    }
}

let messages = 0;
const MAX_MESSAGE_DISPLAYED = 200;

let last_message = "";  // used to ignore duplicates

export function appendMessage(msg, bold = false) {

    if (!msg) return;
    if (msg === last_message) return;

    last_message = msg;

    if (messages >= MAX_MESSAGE_DISPLAYED) {
        console.log("remove first");
        $("#messages-list div:first-child").remove();
    }

    $("#messages-list").append(bold ? `<div class="bold">${msg}</div>` : `<div>${msg}</div>`);
    const e = document.getElementById("messages-list");
    e.scrollTop = e.scrollHeight;
    messages++;
}

export function monitorMessage(control_number, raw_value) {
    const c = MODEL.control[control_number];
    if (!c) {
        warn(`monitorMessage: unknown control ${control_number}`);
        return;
    }
    if (control_number === MODEL.control_id.swell) {
        appendMessage(`${c.name} ${raw_value > 0 ? 'ON' : 'OFF'}`);
    } else if (control_number === MODEL.control_id.bypass) {
        appendMessage(`${c.name} ${raw_value > 0 ? 'ON' : 'OFF'}`);
    } else {
        const v = c.human(raw_value);
        appendMessage(`${c.name} set to ${v}`);
    }
}
