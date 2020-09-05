import {showMidiInActivity} from "./ui_midi_activity";
import {selectPreset, updatePresetSelector} from "./ui_presets";
import {logIncomingMidiMessage} from "./ui_midi_window";
import {
    confirmPresetReceived,
    getLastSendTime,
    isAutoLockOnImport, isFullReadInProgress,
    updateDevice
} from "./midi_out";
import {updateControls, updateModelAndUI} from "./ui";
import {log} from "./debug";
import MODEL from "./model";
import {
    appendMessage,
    monitorMessage
} from "./ui_messages";
import {toHexString} from "./utils";
import {SYSEX_GLOBALS, SYSEX_PRESET, validate} from "./model/sysex";
import {updateGlobalSettings} from "./ui_global_settings";
import {resetExp} from "./ui_exp";
import {addPresetToLibrary} from "./preset_library";
import {device_name} from "./model/constants";

let midi_input = null;

let midi_input2 = null;

export function getMidiInputPort() {
    return midi_input;
}

export function getMidiInput2Port() {
    return midi_input2;
}

export function setMidiInputPort(port) {
    midi_input = port;
    if (port) {
        log(`setMidiInputPort: midi_input assigned to "${port.name}"`);
    } else {
        log("setMidiInputPort: midi_input set to null");
    }
}

export function setMidiInput2Port(port) {
    midi_input2 = port;
    if (port) {
        log(`setMidiInput2Port: midi_input2 assigned to "${port.name}"`);
    } else {
        log("setMidiInput2Port: midi_input2 set to null");
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
 * @param input_num
 */
export function handlePC(msg, input_num = 1) {

    //TODO: almost always an echo that could be ignored

    // suppress echo for the input connected to the pedal):
    if (input_num === 1) {
        const t = performance.now();
        if (t < (getLastSendTime() + 100)) {
            log("handlePC: ignore PC echo");
            return;
        }
    }

    log("handlePC", msg, input_num);

    showMidiInActivity(input_num);

    const pc = msg[1];
    logIncomingMidiMessage("PC", [pc]);

    if (!isFullReadInProgress()) {
        selectPreset(pc)
    }
}

/**
 * Handle all control change messages received
 * @param msg
 * @param input_num
 */
export function handleCC(msg, input_num = 1) {

    // suppress echo for the input connected to the pedal):
    if (input_num === 1) {
        const t = performance.now();
        if (t < (getLastSendTime() + 100)) {
            log("handleCC: ignore CC echo");
            return;
        }
    }

    const cc = msg[1];
    const v = msg[2];

    log(`handleCC input ${input_num}`, cc, v);

    showMidiInActivity(input_num);
    monitorCC(cc);
    logIncomingMidiMessage("CC", [cc, v]);

    updateModelAndUI("cc", cc, v);

    if (input_num === 2) {
        // If we received a message on input 2, we forward it to the pedal if the pedal supports the message's CC.
        if (MODEL.supportsCC(cc)) {
            log("forward CC", cc, v);
            updateDevice("cc", cc, v);
        }
    }

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
    showMidiInActivity(1);

    if (isFullReadInProgress()) {

        log("fullReadInProgress");

        const valid = validate(data);
        if (valid.type === SYSEX_PRESET) {

            let id = data[8];

            data[4] = 0;
            data[8] = 0;

            let n = `${device_name} ${id}`;
            addPresetToLibrary({
                // id: n.replace('.', '_'), // jQuery does not select if the ID contains a dot
                id: n,
                name: n,
                h: toHexString(data),
                locked: isAutoLockOnImport()
            })
        }

    } else {

        confirmPresetReceived();

        const valid = MODEL.setValuesFromSysEx(data);
        switch (valid.type) {
            case SYSEX_PRESET:
                resetExp();
                // updateUI();
                updatePresetSelector();
                updateControls();
                // noinspection JSBitwiseOperatorUsage
                // if (preferences.update_URL & SETTINGS_UPDATE_URL.on_randomize_init_load) {
                //     updateUrl();
                // }
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

}
