import {_0_100, _2_steps, _percent, _ms, control} from "@model";

export const control_id = {
    exp_pedal: 4,
    bypass: 14,             // RIGHT footswitch
    space_decay: 16,
    modulate: 17,
    mix: 18,
    lo_freq: 19,
    pitch_vector: 20,
    hi_freq: 21,
    predelay: 22,
    mod_speed: 23,
    pitch_vector_mix: 24,
    density: 25,
    attack_time: 26,
    vibrato_depth: 27,
    swell: 28,              // LEFT footswitch
    algorithm: 29
};

// human:
const _pitch_vector = function (v) {
    if (v < 1) {
        return "OFF";
    } else if (v < 31) {
        return "- Octave";
    } else if (v < 66) {
        return "Pitch Down";
    } else if (v < 82) {
        return "Pitch Up";
    } else if (v < 110) {
        return "+ 5th";
    } else {
        return "Shimmer";
    }
};

// map_raw:
const _pitch_vector_values = function (v) {
    if (v < 1) {
        return 0;
    } else if (v < 31) {
        return 1;
    } else if (v < 66) {
        return 33;
    } else if (v < 82) {
        return 81;
    } else if (v < 110) {
        return 109;
    } else {
        return 127;
    }
};

const _algorithm = function (v) {
    if (v < 64) {
        return "ultraplate";
    } else {
        return "cathedra";
    }
};

export function defineControls() {

    control[control_id.exp_pedal] = { // 4,
        name: "Exp pedal",
        human: _0_100,
        infos: "The expression pedal works by morphing between two complete settings of all of the knob values (even the second layer knob values)."
    };
    control[control_id.space_decay] = { // 16,
        name: "Space Decay",
        init_value: 63,
        human: _ms,
        sysex: {
            offset: 9,
            mask: [0x7F]
        },
        sysex2: {
            offset: 26,
            mask: [0x7F]
        },
        infos: "Sets decay energy of the reverberation space."
    };
    control[control_id.modulate] = { // 17,
        name: "Modulate",
        init_value: 0,
        human: _percent,
        sysex: {
            offset: 10,
            mask: [0x7F]
        },
        sysex2: {
            offset: 27,
            mask: [0x7F]
        },
        infos: "Sets overall modulation depth of the reverb algorithm."
    };
    control[control_id.mix] = { // 18,
        name: "Mix",
        init_value: 63,
        human: _percent,
        sysex: {
            offset: 11,
            mask: [0x7F]
        },
        sysex2: {
            offset: 28,
            mask: [0x7F]
        },
        infos: "Adjusts Mix of Dry and Wet signals in analog domain."
    };
    control[control_id.lo_freq] = { // 19,
        name: "Low Frequency",
        // human: _percent,
        init_value: 102,
        sysex: {
            offset: 12,
            mask: [0x7F]
        },
        sysex2: {
            offset: 29,
            mask: [0x7F]
        },
        infos: "Changes how low frequencies react in the reverb algorithm. When set closer to max, low frequency decay times are extended giving the impression of a larger room."
    };
    control[control_id.pitch_vector] = { // 20,
        name: "Pitch Vector",
        human: _pitch_vector,
        map_raw: _pitch_vector_values,
        init_value: 0,
        sysex: {
            offset: 13,
            mask: [0x7F]
        },
        sysex2: {
            offset: 30,
            mask: [0x7F]
        },
        infos: "Sets intra tank pitch interval to: Octave down, slight pitch up, slight pitch down, 5th up, or octave up. Decay, Pitch Vector Mix & Hi/Lo Freq controls all interact to sculpt the intra-tank pitch regeneration."
    };
    control[control_id.hi_freq] = { // 21,
        name: "High Frequency",
        // human: _percent,
        init_value: 102,
        sysex: {
            offset: 14,
            mask: [0x7F]
        },
        sysex2: {
            offset: 31,
            mask: [0x7F]
        },
        infos: "Changes how high frequencies react in the reverb algorithm and alters the high frequency absorption of the reverb space. Set lower to reduce the amount of time high frequencies live in the algorithm for a more natural room reverb."
    };
    control[control_id.predelay] = { // 22,
        name: "Predelay",
        human: _ms,
        sysex: {
            offset: 15,
            mask: [0x7F]
        },
        sysex2: {
            offset: 32,
            mask: [0x7F]
        },
        infos: "Sets amount of time that elapses before the onset of reverberation."
    };
    control[control_id.mod_speed] = { // 23,
        name: "Mod Speed",
        // human: _percent,
        init_value: 0,
        sysex: {
            offset: 16,
            mask: [0x7F]
        },
        sysex2: {
            offset: 33,
            mask: [0x7F]
        },
        infos: "Sets dominant modulation speed of the reverb algorithm."
    };
    control[control_id.pitch_vector_mix] = { // 24,
        name: "Pitch Vector Mix",
        init_value: 0,
        human: _percent,
        sysex: {
            offset: 17,
            mask: [0x7F]
        },
        sysex2: {
            offset: 34,
            mask: [0x7F]
        },
        infos: "Adjusts mix between intra-tank pitch shifted reflections and normal reflections inside the reverb tank."
    };
    control[control_id.density] = { //  25,
        name: "Density",
        human: _percent,
        init_value: 0,
        sysex: {
            offset: 18,
            mask: [0x7F]
        },
        sysex2: {
            offset: 35,
            mask: [0x7F]
        },
        infos: "Sets amount of initial build up of echoes before the reverb tank."
    };
    control[control_id.attack_time] = { // 26,
        name: "Attack Time",
        human: _ms,
        init_value: 0,
        sysex: {
            offset: 19,
            mask: [0x7F]
        },
        sysex2: {
            offset: 36,
            mask: [0x7F]
        },
        infos: "Sets the attack time for the swell envelope."
    };
    control[control_id.vibrato_depth] = { // 27,
        name: "Vibrato Depth",
        human: _percent,
        init_value: 0,
        sysex: {
            offset: 20,
            mask: [0x7F]
        },
        sysex2: {
            offset: 37,
            mask: [0x7F]
        },
        infos: "Adds vibrato to the reverb input for lush, haunting trails."
    };
    control[control_id.bypass] = { // 14,
        name: "Bypass",
        no_init: true,
        no_randomize: true,
        map_raw: _2_steps,
        sysex: {
            offset: 21,
            mask: [0x7F]
        },
        infos: "Processes signal when LED is ON, passes dry signal entirely in analog (buffered or relay) when OFF."
    };
    control[control_id.algorithm] = { // 29,
        name: "Algorithm",
        human: _algorithm,
        map_raw: _2_steps,
        sysex: {
            offset: 23,
            mask: [0x7F]
        },
        infos: "ULTRAPLATE: Inspiring &amp; lush plate with a fast build.\nCATHEDRA: Massive & ethereal with a slow build."
    };
    control[control_id.swell] = { // 28,
        name: "Swell",
        no_init: true,
        map_raw: _2_steps,
        sysex: {
            offset: 22,
            mask: [0x7F]
        },
        infos: "Press to engage the auto swell function. Hold to maximize Space Decay sustain."
    };

/*
    // add the missing default properties
    control.forEach(function (obj) {

        obj.cc_number = control.indexOf(obj);
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

        if (obj.hasOwnProperty("sysex2")) {
            obj.two_values = true;    // true for the controls that can have two values, available with the EXP pedal
            obj.init_value2 = obj.init_value;
            obj.raw_value2 = obj.raw_value;
        } else {
            obj.two_values = false;
        }

        obj.changed = function () {
            return obj.raw_value !== obj.init_value;
        }

    });
*/

} // defineControls()

// defineControls();
