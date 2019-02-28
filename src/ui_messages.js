import {warn} from "./debug";
import MODEL from "./model";

export const MSG_SEND_SYSEX = "&#x27A4; To view the current pedal's preset, send a sysex from the Mercury7 by pressing the Bypass LED switch while holding the Alt button.";

/**
 * Makes the app name glows, or not.
 * @param status
 */
export function setMidiInStatus(status) {
    if (status) {
        $(".neon").addClass("glow");
    } else {
        $(".neon").removeClass("glow");
    }
}

export function setStatus(msg, msg2) {  // TODO: change signature, use destructuring and accept any number of messages
    appendMessage(msg);
    if (msg2) appendMessage(msg2);
}

let messages = 0;
const MAX_MESSAGE_DISPLAYED = 200;

export function appendMessage(msg) {

    if (!msg) return;

    if (messages >= MAX_MESSAGE_DISPLAYED) {
        console.log("remove first");
        $("#messages-list div:first-child").remove();
    }

    $("#messages-list").append(`<div>${msg}</div>`);
    const e = document.getElementById("messages-list");
    e.scrollTop = e.scrollHeight;
    messages++;
}

export function appendErrorMessage(msg) {
    // $("#messages-list").append(`<div>&#x26A0; ${msg}</div>`);
    // const e = document.getElementById("messages-list");
    // e.scrollTop = e.scrollHeight;
    // appendMessage('&#x26A0;&nbsp;' + msg);
    appendMessage(msg);
}

export function clearStatus() {
    // $("#info-message").text("");
}

export function setStatusError(msg) {
    // $("#error-message").text(msg);
    appendErrorMessage(msg);
}

export function clearError() {
    // $("#error-message").text("");
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
