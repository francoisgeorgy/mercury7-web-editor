import {control} from "./cc.js";
import meta from "./meta.js";
import {control_id} from "./cc";
import {log, warn} from "../debug";
import {toHexString} from "../utils";
import {SYSEX_CMD} from "./constants";
import {global_conf} from "./global_conf";

// will store the last sysex received (all bytes, without any transformation).
// let last_sysex = Array.from(new Uint8Array(39));

// const saveLastSysEx = function(data) {
//     last_sysex = data;
// };

export const SYSEX_INVALID = 0;
export const SYSEX_IGNORE = 1;
export const SYSEX_PRESET = 2;
export const SYSEX_GLOBALS = 3;

const validate = function (data) {

    log("validate", toHexString(data, ' '));

    const SYSEX_START = 0xF0;
    const SYSEX_END = 0xF7;

    let type = SYSEX_INVALID;   // default value

    if (data[0] !== SYSEX_START) {
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
                message: "Invalid signature"
            };
        }
    }

    if ((data[meta.device_id.sysex.offset] > 0) && (data[meta.device_id.sysex.offset] !== meta.device_id.value)) {
        log(`validate: invalid device_id: ${data[meta.device_id.sysex.offset]}`);
        return {
            type: SYSEX_IGNORE,
            error: "invalid device ID",
            message: "Invalid device ID"
        };
    }

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
    switch(cmd) {
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

/*
    if ([SYSEX_CMD.globals_request, SYSEX_CMD.patch_write, SYSEX_CMD.preset_request].includes(cmd)) {
        if (cmd === 0x28) {
        } else {
            log(`validate: sysex ignored (command: ${cmd.toString(16)})`);
            return {
                type: SYSEX_IGNORE,
                // valid: false,
                error: "ignored sysex command",
                message: ""
            };
        }
    }
*/

    const last_byte = data[data.length - 1];
    // for (let i = 0; i < data.length; i++) {
    //     last_byte = data[i];
    // }

    // console.log("validate, last_byte", last_byte);
    if (last_byte === SYSEX_END) {
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

};

/**
 *
 * @param data
 */
function decodeMeta(data) {
    // console.log("decodeMeta", data, meta);
    meta.preset_id.value = data[meta.preset_id.sysex.offset]
}

/**
 * Get values from sysex data and store the value in a (new) property "value" in each control.
 * @param data
 * @param controls
 */
function decodeControls(data, controls) {

    // console.groupCollapsed("decodeSysExControls");

    for (let i = 0; i < controls.length; i++) {

        if (typeof controls[i] === "undefined") continue;
        if (!controls[i].hasOwnProperty("sysex")) continue;

        let sysex = controls[i].sysex;
        if (!sysex.hasOwnProperty("mask")) continue;

        let raw_value = data[sysex.offset] & sysex.mask[0];

        // if (sysex.hasOwnProperty("f")) {
        //     raw_value = sysex.f(raw_value);
        // }

        let final_value = 0;
        final_value = controls[i].human(raw_value);

        controls[i]["raw_value"] = raw_value;
        controls[i]["value"] = final_value;

        // console.log(`decodeSysExControls: cc=${i} 0x${i.toString(16)}, offset=0x${sysex.offset.toString(16)}, v=${raw_value} 0x${raw_value.toString(16)} ${control[i].name}`);

    }

    // console.groupEnd();
}

function decodeGlobals(data, globals) {

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
const setDump = function (data) {
    const valid = validate(data);
    switch (valid.type) {
        case SYSEX_PRESET:
            // saveLastSysEx(data);
            decodeMeta(data);
            decodeControls(data, control);
            return {
                type: SYSEX_PRESET,
                // valid: true,
                error: "",
                message: ""
            };
        case SYSEX_GLOBALS:
            decodeGlobals(data, global_conf);
            return {
                type: SYSEX_GLOBALS,
                // valid: true,
                error: "",
                message: ""
            };
        default:
            return valid;
    }
    // if (valid.error) {
    //     return valid;
    // }
};

/**
 * Create a SysEx dump data structure
 *
 * @returns {Uint8Array}
 */
const getDump = function () {

    // exemple of dump sent by the Enzo with all values set to 0:
    // 00 20 10 00 01 03 26 04 00 00 00 00 00 00 00 00 00 00 00 00 00 7F 00 00
    // 1  2  3  4  5  6  7  8  9  10                16          20          24


    // const data = new Uint8Array(39); // TODO: create CONST for sysex length  // By default, the bytes are initialized to 0
    // const data = Uint8Array.from(last_sysex);
    const data = new Uint8Array(25);

    data[0] = 0xF0;
    data[1] = 0x00;
    data[2] = 0x20;
    data[3] = 0x10;

    data[4] = 0;    // We set device ID to 0 in order to get a sysex dump that can be sent to any Mercury7.
    data[5] = meta.group_id.value;
    data[6] = meta.model_id.value;

    data[7] = 0x26; // Mercury7 always sent this value when sending a sysex.

    data[8] = meta.preset_id.value;

    data[9] = control[control_id.space_decay].raw_value;
    data[10] = control[control_id.modulate].raw_value;
    data[11] = control[control_id.mix].raw_value;
    data[12] = control[control_id.lo_freq].raw_value;
    data[13] = control[control_id.pitch_vector_mix].raw_value;
    data[14] = control[control_id.hi_freq].raw_value;
    data[15] = control[control_id.predelay].raw_value;
    data[16] = control[control_id.mod_speed].raw_value;
    data[17] = control[control_id.pitch_vector_mix].raw_value;
    data[18] = control[control_id.density].raw_value;
    data[19] = control[control_id.attack_time].raw_value;
    data[20] = control[control_id.vibrato_depth].raw_value;
    data[21] = control[control_id.bypass].raw_value;
    data[22] = control[control_id.swell].raw_value;
    data[23] = control[control_id.algorithm].raw_value;

    data[24] = 0xF7;   // end-of-sysex marker

    log(data, meta.preset_id.value);

    return data;
};

const getSysexDataForGlobalConfig = function(global_num, value) {

    // F0
    // 00 20 10    Meris ID	(different manufacturers have different IDs)
    // 00          Prod ID 	(user definable, matches midi channel)
    // 01          Group ID    (01 = pedal series)
    // 00          Model #	(00 = Ottobit Jr, 01 = Mercury7, 02 = Polymoon)
    // 2A          Command (2A = global edit via sysex)
    // 00          Global Num (listed below, 0 is TRS input)
    // 7F          Value (00 = OFF, 7F = ON)
    // F7

    // 00 01 03 2a 02 7f

    let data = new Uint8Array(6);

    // data[0] = 0xF0;
    // data[1] = 0x00;
    // data[2] = 0x20;
    // data[3] = 0x10;

    data[0] = 0x00;
    data[1] = 0x01;
    data[2] = 0x03;
    data[3] = 0x2A;
    data[4] = global_num;
    data[5] = value;

    // data[10] = 0xF7;   // end-of-sysex marker

    return data;
};

export default {
    validate,
    setDump,
    getDump,
    getSysexDataForGlobalConfig
}
