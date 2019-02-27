import meta from "./meta.js";
import {control, control_id} from "./cc.js";
import {log, warn} from "../debug.js";

// will store the last sysex received (all bytes, without any transformation).
let last_sysex = Array.from(new Uint8Array(39));

const saveLastSysEx = function(data) {
    last_sysex = data;
};

const validate = function (data) {

    log("validate", toHexString(data, ' '));

    const SYSEX_START = 0xF0;
    const SYSEX_END = 0xF7;

    if (data[0] !== SYSEX_START) {
        warn("validate: invalid start byte", data[0]);
        return {
            valid: false,
            error: "invalid start byte",
            message: ""
        };
    }

    let offset = meta.signature.sysex.offset;
    for (let i = 0; i < meta.signature.sysex.value.length; i++) {
        if (data[offset + i] !== meta.signature.sysex.value[i]) {
            log(`validate: invalid sysex at offset ${offset + i}. Expected ${meta.signature.sysex.value[i]}. Found ${data[offset + i]}`);
            return {
                valid: false,
                error: "invalid manufacturer ID",
                message: ""
            };
        }
    }

    if ((data[meta.device_id.sysex.offset] > 0) && (data[meta.device_id.sysex.offset] !== meta.device_id.value)) {
        log(`validate: invalid device_id: ${data[meta.device_id.sysex.offset]}`);
        return {
            valid: false,
            error: "invalid device ID",
            message: ""
        };
    }

    if (data[meta.group_id.sysex.offset] !== meta.group_id.value) {
        log(`validate: invalid group_id: ${data[meta.group_id.sysex.offset]}`);
        return {
            valid: false,
            error: "invalid group ID",
            message: ""
        };
    }

    if (data[meta.model_id.sysex.offset] !== meta.model_id.value) {
        log(`validate: invalid model_id: ${data[meta.model_id.sysex.offset]}`);
        return {
            valid: false,
            error: "invalid model ID",
            message: "SysEx is for another Meris product."
        };
    }

    let last_byte = 0;
    for (let i = 0; i < data.length; i++) {
        last_byte = data[i];
    }

    // console.log("validate, last_byte", last_byte);
    if (last_byte === SYSEX_END) {
        return {
            valid: true,
            error: "",
            message: ""
        }
    } else {
        log(`validate: invalid end marker: ${last_byte}`);
        return {
            valid: last_byte === SYSEX_END,
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

/**
 * Set values from a SysEx dump
 * @param data
 * @returns {*}
 */
const setDump = function (data) {
    const valid = validate(data);
    if (valid.error) {
        return valid;
    }
    saveLastSysEx(data);
    decodeMeta(data);
    decodeControls(data, control);
    return {
        valid: true,
        error: "",
        message: ""
    };
};

/**
 * Create a SysEx dump data structure
 *
 * @returns {Uint8Array}
 */
const getDump = function () {

    // const data = new Uint8Array(39); // TODO: create CONST for sysex length  // By default, the bytes are initialized to 0
    const data = Uint8Array.from(last_sysex);

    data[0] = 0xF0;
    data[1] = 0x00;
    data[2] = 0x20;
    data[3] = 0x10;

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

    data[38] = 0xF7;   // end-of-sysex marker

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
