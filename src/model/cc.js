
export const control_id = {
    exp_pedal: 4,
    bypass: 14,
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
    swell: 28,
    algorithm: 29
};

export const control = new Array(127);

const _percent = function (v) {
    return Math.floor(v / 127 * 100 + 0.5) + '%';
};
/*
const _off_when_zero = function (v) {
    return v === 0 ? 'OFF' : v;
};
*/

const _2_steps = function (v) {
    return v < 64 ? 0 : 127;
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
        return "ULTRAPLATE";
    } else {
        return "CATHEDRA";
    }
};

function defineControls() {
    // control[control_id.exp_pedal] = { // 4,
        name: "Exp pedal"   //,
        // sysex: {
        //     offset: 22,
        //     mask: [0x7F]
        // }
    // };
    control[control_id.space_decay] = { // 16,
        name: "Space Decay",
        init_value: 80,
        human: _percent,
        sysex: {
            offset: 9,
            mask: [0x7F]
        }
    };
    control[control_id.modulate] = { // 17,
        name: "Modulate",
        init_value: 13,
        human: _percent,
        sysex: {
            offset: 10,
            mask: [0x7F]
        }
    };
    control[control_id.mix] = { // 18,
        name: "Mix",
        init_value: 63,
        human: _percent,
        sysex: {
            offset: 11,
            mask: [0x7F]
        }
    };
    control[control_id.lo_freq] = { // 19,
        name: "Lo Freq",
        human: _percent,
        init_value: 127,
        sysex: {
            offset: 12,
            mask: [0x7F]
        }
    };
    control[control_id.pitch_vector] = { // 20,
        name: "Pitch Vector",
        human: _pitch_vector,
        map_raw: _pitch_vector_values,
        init_value: 0,
        sysex: {
            offset: 13,
            mask: [0x7F]
        }
    };
    control[control_id.hi_freq] = { // 21,
        name: "Hi Freq",
        human: _percent,
        init_value: 127,
        sysex: {
            offset: 14,
            mask: [0x7F]
        }
    };
    control[control_id.predelay] = { // 22,
        name: "Predelay",
        sysex: {
            offset: 15,
            mask: [0x7F]
        }
    };
    control[control_id.mod_speed] = { // 23,
        name: "Mod Speed",
        init_value: 21,
        sysex: {
            offset: 16,
            mask: [0x7F]
        }
    };
    control[control_id.pitch_vector_mix] = { // 24,
        name: "Pitch Vector Mix",
        init_value: 89,
        human: _percent,
        sysex: {
            offset: 17,
            mask: [0x7F]
        }
    };
    control[control_id.density] = { //  25,
        name: "Density",
        human: _percent,
        init_value: 127,
        sysex: {
            offset: 18,
            mask: [0x7F]
        }
    };
    control[control_id.attack_time] = { // 26,
        name: "Attack Time",
        init_value: 63,
        sysex: {
            offset: 19,
            mask: [0x7F]
        }
    };
    control[control_id.vibrato_depth] = { // 27,
        name: "Vibrato Depth",
        human: _percent,
        init_value: 0,
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
    control[control_id.algorithm] = { // 29,
        name: "Algorithm",
        human: _algorithm,
        map_raw: _2_steps,
        sysex: {
            offset: 23,
            mask: [0x7F]
        }
    };
    control[control_id.swell] = { // 28,
        name: "Swell",
        no_init: true,
        map_raw: _2_steps,
        sysex: {
            offset: 22,
            mask: [0x7F]
        }
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
