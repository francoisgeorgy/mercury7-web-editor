import {control_id} from "@device/model/cc";
import {control} from "@model";
import {GROUP_ID, MODEL_ID} from "@model/sysex";

export const SYNTH_MODES = {
    dry: 0,
    mono: 63,
    arp: 95,
    poly: 127
};

export const WAVESHAPES = {
    sawtooth: 0,
    square: 127
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

    data[i++] = control[control_id.pitch].raw_value;                // 9
    data[i++] = control[control_id.filter].raw_value;
    data[i++] = control[control_id.mix].raw_value;
    data[i++] = control[control_id.sustain].raw_value;
    data[i++] = control[control_id.filter_envelope].raw_value;
    data[i++] = control[control_id.modulation].raw_value;
    data[i++] = control[control_id.portamento].raw_value;
    data[i++] = control[control_id.filter_type].raw_value;
    data[i++] = control[control_id.delay_level].raw_value;
    data[i++] = control[control_id.ring_modulation].raw_value;
    data[i++] = control[control_id.filter_bandwidth].raw_value;
    data[i++] = control[control_id.delay_feedback].raw_value;
    data[i++] = control[control_id.bypass].raw_value;
    data[i++] = control[control_id.envelope_type].raw_value;
    data[i++] = control[control_id.synth_mode].raw_value;
    data[i++] = control[control_id.synth_waveshape].raw_value;
    data[i++] = control[control_id.tempo].raw_value;

    // values 2 (EXP)
    data[i++] = control[control_id.pitch].raw_value2;               // 26
    data[i++] = control[control_id.filter].raw_value2;
    data[i++] = control[control_id.mix].raw_value2;
    data[i++] = control[control_id.sustain].raw_value2;
    data[i++] = control[control_id.filter_envelope].raw_value2;
    data[i++] = control[control_id.modulation].raw_value2;
    data[i++] = control[control_id.portamento].raw_value2;
    data[i++] = control[control_id.filter_type].raw_value2;
    data[i++] = control[control_id.delay_level].raw_value2;
    data[i++] = control[control_id.ring_modulation].raw_value2;
    data[i++] = control[control_id.filter_bandwidth].raw_value2;
    data[i++] = control[control_id.delay_feedback].raw_value2;      // 37

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
