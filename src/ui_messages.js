
// export const MSG_SEND_SYSEX = "To update the editor with the current setup of your Mercury7, please send a sysex from the Mercury7 by pressing the Bypass LED switch while holding the Alt button.";
export const MSG_SEND_SYSEX = "To view the current pedal's preset, send a sysex from the Mercury7 by pressing the Bypass LED switch while holding the Alt button.";

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

export function setStatus(msg, msg2) {
    $("#info-message").html(msg2 === undefined ? msg : (msg + '<br />' + msg2));
}

export function clearStatus() {
    $("#info-message").text("");
}

export function setStatusError(msg) {
    $("#error-message").text(msg);
}

export function clearError() {
    $("#error-message").text("");
}
