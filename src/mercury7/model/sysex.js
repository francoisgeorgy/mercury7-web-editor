import {control_id} from "@device/model/cc";
import {control} from "@model";
import {GROUP_ID, MODEL_ID} from "@model/sysex";

export const PITCH_VECTOR = {
    off: 0,
    octave_down: 63,
    pitch_up: 95,
    pitch_down: 96,
    fifth_up: 100,
    octave_up: 127
};

export const ALGORITHM = {
    ultraplate: 0,
    cathedra: 127
};

/**
 * Create a SysEx dump data structure
 * @param complete If false do not include the sysex header and footer bytes nor the manufacturer ID
 * @returns {Uint8Array}
 */
// export function getPreset(complete = true) {
export function getDataForPreset() {

    const data = new Uint8Array(29);

    let i = 0;

    // if (complete) {
    //     data[i++] = SYSEX_START_BYTE;                               // 0
    //     data[i++] = 0x00;
    //     data[i++] = 0x20;
    //     data[i++] = 0x10;
    // }
    //
    // data[i++] = 0;    // We set device ID to 0 in order to get a sysex dump that can be sent to any Enzo.
    // data[i++] = meta.group_id.value;
    // data[i++] = meta.model_id.value;
    //
    // data[i++] = 0x26; // Enzo always sent this value when sending a sysex.
    //
    // data[i++] = meta.preset_id.value;                               // 8

    data[i++] = control[control_id.space_decay].raw_value;          // 9
    data[i++] = control[control_id.modulate].raw_value;             // 10
    data[i++] = control[control_id.mix].raw_value;
    data[i++] = control[control_id.lo_freq].raw_value;
    data[i++] = control[control_id.pitch_vector].raw_value;
    data[i++] = control[control_id.hi_freq].raw_value;
    data[i++] = control[control_id.predelay].raw_value;
    data[i++] = control[control_id.mod_speed].raw_value;            // 16
    data[i++] = control[control_id.pitch_vector_mix].raw_value;
    data[i++] = control[control_id.density].raw_value;
    data[i++] = control[control_id.attack_time].raw_value;
    data[i++] = control[control_id.vibrato_depth].raw_value;        // 20
    data[i++] = control[control_id.bypass].raw_value;
    data[i++] = control[control_id.swell].raw_value;
    data[i++] = control[control_id.algorithm].raw_value;            // 23
    data[i++] = 0;                                                  // 24 (always 0)
    data[i++] = 0;                                                  // 25 (always 0)

    // values 2 (EXP)
    data[i++] = control[control_id.space_decay].raw_value2;         // 26
    data[i++] = control[control_id.modulate].raw_value2;
    data[i++] = control[control_id.mix].raw_value2;
    data[i++] = control[control_id.lo_freq].raw_value2;
    data[i++] = control[control_id.pitch_vector].raw_value2;
    data[i++] = control[control_id.hi_freq].raw_value2;
    data[i++] = control[control_id.predelay].raw_value2;            // 32
    data[i++] = control[control_id.mod_speed].raw_value2;
    data[i++] = control[control_id.pitch_vector_mix].raw_value2;    // 34
    data[i++] = control[control_id.density].raw_value2;
    data[i++] = control[control_id.attack_time].raw_value2;
    data[i++] = control[control_id.vibrato_depth].raw_value2;       // 37

    // if (complete) data[i] = SYSEX_END_BYTE;                         // 38

    // log(data, meta.preset_id.value);

    return data;
}

export function getDataForGlobalConfig(global_num, value) {

    // F0
    // 00 20 10    Meris ID	(different manufacturers have different IDs)
    // 00          Prod ID 	(user definable, matches midi channel)
    // 01          Group ID    (01 = pedal series)
    // 03          Model #	(00 = Ottobit Jr, 01 = Mercury7, 02 = Polymoon, 03 = Enzo)
    // 2A          Command (2A = global edit via sysex)
    // 00          Global Num (listed below, 0 is TRS input)
    // 7F          Value (00 = OFF, 7F = ON)
    // F7

    let data = new Uint8Array(6);

    data[0] = 0x00;
    data[1] = GROUP_ID.pedal;
    data[2] = MODEL_ID.MERCURY7;
    data[3] = 0x2A;
    data[4] = global_num;
    data[5] = value;

    return data;
}
