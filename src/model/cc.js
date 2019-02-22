
export const control_id = {
    exp_pedal: 4,
    envelope_type: 9,
    bypass: 14,
    tempo: 15,
    pitch: 16,
    filter: 17,
    mix: 18,
    sustain: 19,
    filter_envelope: 20,
    modulation: 21,
    portamento: 22,
    filter_type: 23,
    delay_level: 24,
    ring_modulation: 25,
    filter_bandwidth: 26,
    delay_feedback: 27,
    tap: 28,
    synth_mode: 29,
    synth_waveshape: 30
};

export const control = new Array(127);

const _percent = function (v) {
    return Math.floor(v / 127 * 100 + 0.5) + '%';
};

const _off_when_zero = function (v) {
    return v === 0 ? 'OFF' : v;
};

const _2_steps = function (v) {
    return v < 64 ? 0 : 127;
};

const _4_steps = function (v) {
    if (v < 32) {
        return 0;
    } else if (v < 64) {
        return 63;
    } else if (v < 96) {
        return 95;
    } else {
        return 127;
    }
};

// half steps increments
//
// 0, 1,
// 12, 16, 20, 24, ... 56
// 72, 76, ... 116,
// 127
//
const _pitch = function (v) {
    if (v === 0) {
        return "-2 oct";
    } else if (v < 12) {
        return "-1 oct";
    } else if (v < 56) {
        return Math.floor((v - 56) / 4);
    } else if (v >= 56 && v < 72) {
        return "0";
    } else if (v < 116) {
        return Math.floor((v - 68) / 4);
    } else if (v < 127) {
        return "+1 oct";
    } else {
        return "+2 oct";
    }
};

// human:
const _filter_type = function (v) {
    if (v < 4) {
        return "ladder LP";
    } else if (v < 33) {
        return "ladder BP";
    } else if (v < 60) {
        return "ladder HP";
    } else if (v < 88) {
        return "state variable LP";
    } else if (v < 116) {
        return "state variable BP";
    } else {
        return "state variable HP";
    }
};

// map_raw:
const _filter_type_values = function (v) {
    if (v < 4) {
        return 0;
    } else if (v < 33) {
        return 32;
    } else if (v < 60) {
        return 59;
    } else if (v < 88) {
        return 87;
    } else if (v < 116) {
        return 115;
    } else {
        return 127;
    }
};

const _filter_env = function (v) {
    if (v===0) return "OFF";
    if (v < 64) {
        return `D ${63-v}`;
    } else {
        return `A ${v-64}`;
    }
};

const _env_type = function (v) {
    if (v < 64) {
        return "TRIGGERED";
    } else {
        return "FOLLOWER";
    }
};

const _synth_mode = function (v) {
    if (v < 32) {
        return "DRY";
    } else if (v < 64) {
        return "MONO";
    } else if (v < 96) {
        return "ARP";
    } else {
        return "POLY";
    }
};

const _waveshape = function (v) {
    if (v < 64) {
        return "SAWTOOTH";
    } else {
        return "SQUARE";
    }
};

const _tempo = function (v) {
    // const bpm = v > 0 ? Math.round(60000 / (v * 10)) : "inf ";
    return (v * 10) + "ms";
};

function defineControls() {
    control[control_id.exp_pedal] = { // 4,
        name: "Exp pedal",
        sysex: {
            offset: 22,
            mask: [0x7F]
        }
    };
    control[control_id.tempo] = { // 15,
        name: "Tempo",
        human: _tempo,
        //TODO: tempo from sysex
    };
    control[control_id.pitch] = { // 16,
        name: "Pitch",
        init_value: 63,
        cc_center: [63, 64],
        human: _pitch,
        sysex: {
            offset: 9,
            mask: [0x7F]
        }
    };
    control[control_id.filter] = { // 17,
        name: "Filter",
        init_value: 127,
        sysex: {
            offset: 10,
            mask: [0x7F]
        }
    };
    control[control_id.mix] = { // 18,
        name: "Mix",
        init_value: 127,
        human: _percent,
        sysex: {
            offset: 11,
            mask: [0x7F]
        }
    };
    control[control_id.sustain] = { // 19,
        name: "Sustain",
        sysex: {
            offset: 12,
            mask: [0x7F]
        }
    };
    control[control_id.filter_envelope] = { // 20,
        name: "Filter env",
        human: _filter_env,
        sysex: {
            offset: 13,
            mask: [0x7F]
        }
    };
    control[control_id.modulation] = { // 21,
        name: "Modulation",
        human: _off_when_zero,
        sysex: {
            offset: 14,
            mask: [0x7F]
        }
    };
    control[control_id.portamento] = { // 22,
        name: "Portamento",
        sysex: {
            offset: 15,
            mask: [0x7F]
        }
    };
    control[control_id.filter_type] = { // 23,
        name: "Filter type",
        human: _filter_type,
        map_raw: _filter_type_values,
        sysex: {
            offset: 16,
            mask: [0x7F]
        }
    };
    control[control_id.delay_level] = { // 24,
        name: "Delay level",
        sysex: {
            offset: 17,
            mask: [0x7F]
        }
    };
    control[control_id.ring_modulation] = { //  25,
        name: "Ring modulation",
        sysex: {
            offset: 18,
            mask: [0x7F]
        }
    };
    control[control_id.filter_bandwidth] = { // 26,
        name: "Filter Q",
        sysex: {
            offset: 19,
            mask: [0x7F]
        }
    };
    control[control_id.delay_feedback] = { // 27,
        name: "Delay feedback",
        sysex: {
            offset: 20,
            mask: [0x7F]
        }
    };
    control[control_id.bypass] = { // 14,
        name: "Bypass",
        no_init: true,
        no_randomize: true,
        map_raw: _2_steps,
        sysex: {
            offset: 21,
            mask: [0x7F]
        }
    };
    control[control_id.envelope_type] = { // 9,
        name: "Envelope type",
        human: _env_type,
        map_raw: _2_steps,
        sysex: {
            offset: 22,
            mask: [0x7F]
        }
    };
    control[control_id.synth_mode] = { // 29,
        name: "Synth mode",
        init_value: 63,
        human: _synth_mode,
        map_raw: _4_steps,
        sysex: {
            offset: 23,
            mask: [0x7F]
        }
    };
    control[control_id.synth_waveshape] = { // 30
        name: "Waveshape",
        init_value: 0,
        human: _waveshape,
        map_raw: _2_steps,
        sysex: {
            offset: 24,
            mask: [0x7F]
        }
    };
    control[control_id.tap] = { // 28,
        name: "Tap",
        no_init: true,
        no_randomize: true,
        map_raw: () => 127,
        // sysex: {
        //     offset: 22,
        //     mask: [0x7F]
        // }
    };

    // add the missing default properties
    control.forEach(function (obj) {

        obj.cc_number = control.indexOf(obj);   // is also the msb
        obj.cc_type = "cc";

        let bits = 7;

        if (!obj.hasOwnProperty("human")) {
            obj.human = v => v;
        }

        if (!obj.hasOwnProperty("on_off")) {
            obj.on_off = false;
        }

        if (!obj.hasOwnProperty("range")) {
            obj.range = obj.on_off ? [0, 1] : [0, (1 << bits) - 1];
        }

        if (!obj.hasOwnProperty("cc_range")) {
            obj.cc_range = [0, (1 << bits) - 1];
        }

        // pre-computed value that may be useful:
        obj.cc_min = Math.min(...obj.cc_range);
        obj.cc_max = Math.max(...obj.cc_range);
        obj.cc_delta = obj.cc_max - obj.cc_min;

        if (!obj.hasOwnProperty("init_value")) {
            if (obj.hasOwnProperty("cc_center")) {
                // console.log(`cc-${obj.cc_number}: obj.init_value = obj.cc_center: ${obj.init_value}=${obj.cc_center}`);
                obj.init_value = Array.isArray(obj.cc_center) ? obj.cc_center[0] : obj.cc_center;
            } else if ((Math.min(...obj.range) < 0) && (Math.max(...obj.range) > 0)) {
                obj.init_value = (1 << (bits - 1)) - 1; // very simple rule: we take max/2 as default value
            } else {
                obj.init_value = Math.min(...obj.range);
            }
        }

        if (!obj.hasOwnProperty("raw_value")) {
            obj.raw_value = obj.init_value;
        }

        obj.changed = function () {
            return obj.raw_value !== obj.init_value;
        }

    });

} // defineControls()

defineControls();
