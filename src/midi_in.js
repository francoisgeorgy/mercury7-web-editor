import {showMidiInActivity} from "./ui_midi_activity";
import {updatePresetSelector} from "./ui_presets";
import {logIncomingMidiMessage} from "./ui_midi_window";
import {getLastSendTime} from "./midi_out";
import {updateModelAndUI, updateUI} from "./ui";
import {log} from "./debug";
import MODEL from "./model";
import {
    appendMessage,
    monitorMessage
} from "./ui_messages";
import {toHexString} from "./utils";
import {SYSEX_GLOBALS, SYSEX_PRESET} from "./model/sysex";
import {updateGlobalSettings} from "./ui_global_settings";
import {resetExp} from "./ui_exp";
import {updateUrl} from "./url";
import {preferences, SETTINGS_UPDATE_URL} from "./preferences";

let midi_input = null;

export function getMidiInputPort() {
    return midi_input;
}

export function setMidiInputPort(port) {
    midi_input = port;
    if (port) {
        log(`setMidiInputPort: midi_input assigned to "${port.name}"`);
    } else {
        log("setMidiInputPort: midi_input set to null");
    }
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

    //TODO: almost always an echo that could be ignored

    log("handlePC", msg);
    if (msg.type !== "programchange") return;
    // appendMessage(`Preset ${pc} selected`);  //TODO: filter if we are the one sending the PC; otherwise display the message.
    showMidiInActivity();
    logIncomingMidiMessage("PC", [msg.value]);
    MODEL.setPresetNumber(msg.value);
    updatePresetSelector();
}

/**
 * Handle all control change messages received
 * @param msg
 */
export function handleCC(msg) {

    // suppress echo:
    const t = performance.now();
    if (t < (getLastSendTime() + 100)) {
        log("handleCC: ignore CC echo");
        return;
    }

    const cc = msg[1];
    const v = msg[2];

    log("handleCC", cc, v);

    showMidiInActivity();
    monitorCC(cc);
    logIncomingMidiMessage("CC", [cc, v]);
    updateModelAndUI("cc", cc, v);
}

let suppress_sysex_echo = null;

/**
 * Set a flag to ignore the next incoming sysex only. The following sysex will not be ignored.
 * @param data Data to ignore
 */
export function suppressSysexEcho(data) {
    suppress_sysex_echo = data === null ? null : data.slice();
}

export function isSysexEcho(data) {
    if (suppress_sysex_echo === null) return false;
    // the sysex received contains the header, footer and manufacturer id bytes. The sysex we have as reference does not.
    if (suppress_sysex_echo.length !== (data.length - 5)) return false;
    for (let i=0; i < suppress_sysex_echo.length; i++) {
        if (data[i+4] !== suppress_sysex_echo[i]) return false;
    }
    return true;
}

export function handleSysex(data) {

    if (isSysexEcho(data)) {
        log("%chandleSysex: ignore sysex echo", "color:red;font-weight:bold");
        suppress_sysex_echo = null;
        return;
    }

    log("%chandleSysex: SysEx received", "color: yellow; font-weight: bold", toHexString(data, ' '));
    showMidiInActivity();
    const valid = MODEL.setValuesFromSysEx(data);
    switch (valid.type) {
        case SYSEX_PRESET:
            resetExp();
            updateUI();
            if (preferences.update_URL & SETTINGS_UPDATE_URL.on_randomize_init_load) {
                updateUrl();
            }
            // setPresetClean();
            appendMessage(`Preset ${MODEL.meta.preset_id.value} sysex received.`);
            break;
        case SYSEX_GLOBALS:
            updateGlobalSettings();
            appendMessage(`Global config settings received.`);
            break;
        default:
            appendMessage(valid.message);
    }

}
