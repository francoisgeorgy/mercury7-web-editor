import {showMidiInActivity} from "./ui_midi_activity";
import {displayPreset, setPresetNumber} from "./ui_presets";
import {logIncomingMidiMessage} from "./ui_midi_window";
import {getLastSendTime, sendCC} from "./midi_out";
import {updateModelAndUI, updateUI} from "./ui";
import {log} from "./debug";
import MODEL from "./model";
import {
    appendErrorMessage,
    appendMessage,
    clearError,
    clearStatus,
    monitorMessage,
    setStatus,
    setStatusError
} from "./ui_messages";

let midi_input = null;

let suppress_sysex_echo = false;

export function getMidiInputPort() {
    return midi_input;
}

export function setMidiInputPort(port) {
    midi_input = port;
}

export function setSuppressSysexEcho(v = true) {
    suppress_sysex_echo = v;
}

const monitors = new Array(127);

function monitorCC(control_number) {
    if (!MODEL.control[control_number]) return;
    clearTimeout(monitors[control_number]);
    monitors[control_number] = setTimeout(() => {
        const v = MODEL.control[control_number].raw_value;
        log(`monitor receive CC ${control_number} = ${v}`);
        monitorMessage(control_number, v);
    }, 200)
}

/**
 * Handle Program Change messages
 * @param msg
 */
export function handlePC(msg) {

    log("receive PC", msg);

    if (msg.type !== "programchange") return;

    // appendMessage(`Preset ${pc} selected`);  //TODO: filter if we are the one sending the PC; otherwise display the message.

    showMidiInActivity();

    logIncomingMidiMessage("PC", 0, msg.value);

    setPresetNumber(msg.value);
    displayPreset();

}

/**
 * Handle all control change messages received
 * @param msg
 */
export function handleCC(msg) {

    const t = performance.now();
    // console.log(last_send_time, t);

    // suppress echo:
    if (t < (getLastSendTime() + 100)) {
        return;
    }

    const cc = msg[1];
    const v = msg[2];

    log("receive CC", cc, v);

    showMidiInActivity();

    monitorCC(cc);

    logIncomingMidiMessage("CC", cc, v);

    // if (MODEL.control[cc]) {
    updateModelAndUI("cc", cc, v);
    // } else {
    //     warn(`unsupported CC: ${cc}`)
    // }
}

export function handleSysex(data) {

    log("%chandleSysex: SysEx received", "color: yellow; font-weight: bold");

    if (suppress_sysex_echo) {
        log("handleSysex: suppress echo (ignore sysex received)");
        suppress_sysex_echo = false;
        return;
    }

    const valid = MODEL.setValuesFromSysEx(data);
    if (valid.error) {
        appendErrorMessage(valid.message);
    } else {
        updateUI();
        clearError();
        setStatus(`SysEx received with preset #${MODEL.meta.preset_id.value}.`);
        log("Device updated with SysEx");
    }

}
