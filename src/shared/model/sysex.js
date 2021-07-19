import meta from "@device/model/meta";
import {control} from "@model";
import {toHexString} from "@utils";
import {global_conf} from "@device/model/global_conf";
import {getDataForPreset} from "@device/model/sysex";

export const SYSEX_START_BYTE = 0xF0;
export const SYSEX_END_BYTE = 0xF7;

// results of validate(...):
export const SYSEX_INVALID = 0;
export const SYSEX_IGNORE = 1;
export const SYSEX_PRESET = 2;
export const SYSEX_GLOBALS = 3;

export const SYSEX_CMD = {
    preset_request: 0x25,
    preset_response: 0x26,      // TO BE CONFIRMED
    globals_request: 0x27,
    globals_response: 0x28,     // TO BE CONFIRMED
    preset_write: 0x29
};

export const GROUP_ID = {
    pedal: 1
};

export const MODEL_ID = {
    OTTOBITJR: 0,
    MERCURY7: 1,
    POLYMOON: 2,
    ENZO: 3
};

export function getPresetBytes(complete = true) {

    // const data = new Uint8Array(complete ? 39 : 34);
    const data = [];

    if (complete) {
        data.push(SYSEX_START_BYTE);                               // 0
        data.push(0x00);
        data.push(0x20);
        data.push(0x10);
    }

    data.push(0);    // We set device ID to 0 in order to get a sysex dump that can be sent to Meris pedal.
    data.push(meta.group_id.value);
    data.push(meta.model_id.value);
    data.push(0x26); // A Meris pedal always sent this value when sending a sysex.
    data.push(meta.preset_id.value);                               // 8

    data.push(...getDataForPreset());

    if (complete) data.push(SYSEX_END_BYTE);                         // 38

    return Uint8Array.from(data);
}

export function validate(data) {

    log("validate", toHexString(data, ' '));

    let type = SYSEX_INVALID;   // default value

    if (data[0] !== SYSEX_START_BYTE) {
        warn("validate: invalid start byte", data[0]);
        return {
            type: SYSEX_INVALID,
            error: "invalid start byte",
            message: "Invalid header"
        };
    }

    let offset = meta.signature.sysex.offset;
    for (let i = 0; i < meta.signature.sysex.value.length; i++) {
        if (data[offset + i] !== meta.signature.sysex.value[i]) {
            log(`validate: invalid sysex at offset ${offset + i}. Expected ${meta.signature.sysex.value[i]}. Found ${data[offset + i]}`);
            return {
                type: SYSEX_IGNORE,
                error: "invalid manufacturer ID",
                message: "Invalid signature. Try selecting a preset."
            };
        }
    }

    /*
        FIXME: device id should match midi channel

        if ((data[meta.device_id.sysex.offset] > 0) && (data[meta.device_id.sysex.offset] !== meta.device_id.value)) {
            log(`validate: invalid device_id: ${data[meta.device_id.sysex.offset]}`);
            return {
                type: SYSEX_IGNORE,
                error: "invalid device ID",
                message: "Invalid device ID"
            };
        }
    */

    if (data[meta.group_id.sysex.offset] !== meta.group_id.value) {
        log(`validate: invalid group_id: ${data[meta.group_id.sysex.offset]}`);
        return {
            type: SYSEX_IGNORE,
            error: "invalid group ID",
            message: "Invalid group ID"
        };
    }

    if (data[meta.model_id.sysex.offset] !== meta.model_id.value) {
        log(`validate: invalid model_id: ${data[meta.model_id.sysex.offset]}`);
        return {
            type: SYSEX_IGNORE,
            error: "invalid model ID",
            message: "SysEx is for another Meris product."
        };
    }

    // we ignore known commands, we let the other pass
    const cmd = data[meta.command.sysex.offset];
    // log("***", toHexString(data), data, meta.command.sysex.offset, data[meta.command.sysex.offset], cmd);
    switch (cmd) {
        case SYSEX_CMD.preset_request:
            log("validate: sysex is request for preset");
            type = SYSEX_IGNORE;
            break;
        case SYSEX_CMD.preset_response:
            log("validate: sysex is preset data");
            type = SYSEX_PRESET;
            break;
        case SYSEX_CMD.globals_request:
            log("validate: sysex is request for globals");
            type = SYSEX_IGNORE;
            break;
        case SYSEX_CMD.globals_response:
            log("validate: sysex is globals data");
            type = SYSEX_GLOBALS;
            break;
        case SYSEX_CMD.preset_write:
            log("validate: sysex is preset write");
            type = SYSEX_IGNORE;
            break;
        default:
            log(`validate: sysex is unknown command: ${cmd}`);
            type = SYSEX_IGNORE;
            break;
    }

    const last_byte = data[data.length - 1];
    if (last_byte === SYSEX_END_BYTE) {
        log("validate: the sysex is valid");
        return {
            type,
            error: "",
            message: ""
        }
    } else {
        log(`validate: invalid end marker: ${last_byte}`);
        return {
            type: SYSEX_INVALID,
            error: "invalid end marker",
            message: ""
        }
    }
}

/**
 *
 * @param data
 */
export function decodeMeta(data) {
    log("decodeMeta", data);
    meta.preset_id.value = data[meta.preset_id.sysex.offset]
    log("decodeMeta: meta.preset_id.value", meta.preset_id.value);
}

/**
 * Get values from sysex data and store the value in a (new) property "value" in each control.
 * @param data
 * @param controls
 */
export function decodeControls(data, controls) {

    for (let i = 0; i < controls.length; i++) {

        if (typeof controls[i] === "undefined") continue;
        if (!controls[i].hasOwnProperty("sysex")) continue;

        let sysex = controls[i].sysex;
        if (!sysex.hasOwnProperty("mask")) continue;

        let raw_value = data[sysex.offset] & sysex.mask[0];

        // let final_value = 0;
        let final_value = controls[i].human(raw_value);

        controls[i]["raw_value"] = raw_value;
        controls[i]["value"] = final_value;

        // 2nd value for the controls that support it:
        if (control[i].hasOwnProperty("sysex2")) {

            sysex = controls[i].sysex2;
            if (!sysex.hasOwnProperty("mask")) continue;

            if (sysex.offset >= data.length) {
                // if second values not present in sysex, than we simply use the first values
            } else {
                raw_value = data[sysex.offset] & sysex.mask[0];
                final_value = controls[i].human(raw_value);
            }

            controls[i]["raw_value2"] = raw_value;
            controls[i]["value2"] = final_value;
        }

        // console.log(`decodeSysExControls: cc=${i} 0x${i.toString(16)}, offset=0x${sysex.offset.toString(16)}, v=${raw_value} 0x${raw_value.toString(16)} ${control[i].name}`);

    }

}

export function decodeGlobals(data, globals) {

    //TODO: decodeControls and decodeGlobals should be the same function

    for (let i = 0; i < globals.length; i++) {

        if (typeof globals[i] === "undefined") continue;
        if (!globals[i].hasOwnProperty("sysex")) continue;

        const sysex = globals[i].sysex;
        if (!sysex.hasOwnProperty("mask")) continue;

        globals[i]["value"] = data[sysex.offset] & sysex.mask[0];
    }
}

/**
 * Set values from a SysEx dump
 * @param data
 * @returns {*}
 */
export function decodeSysex(data, ignorePresetID = false) {

    log("decodeSysex: ignorePresetID", ignorePresetID);

    const valid = validate(data);
    switch (valid.type) {
        case SYSEX_PRESET:
            log("decodeSysex: sysex is preset data");
            if (!ignorePresetID) {
                decodeMeta(data);
            }
            decodeControls(data, control);
            return {
                type: SYSEX_PRESET,
                error: "",
                message: ""
            };
        case SYSEX_GLOBALS:
            log("decodeSysex: sysex is globals data");
            decodeGlobals(data, global_conf);
            return {
                type: SYSEX_GLOBALS,
                error: "",
                message: ""
            };
        default:
            log("decodeSysex: sysex is not preset nor globals; probably an echo; ignored");
            return valid;
    }
}
