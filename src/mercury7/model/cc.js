import {_0_100, _2_steps, _4_steps, _off_when_zero_percent, _percent, _tempo_ms, control} from "@model";

export const control_id = {
    exp_pedal: 4,
    envelope_type: 9,       // ALT / 2nd layer
    bypass: 14,
    tempo: 15,
    pitch: 16,
    filter: 17,
    mix: 18,
    sustain: 19,
    filter_envelope: 20,
    modulation: 21,
    portamento: 22,         // ALT / 2nd layer
    filter_type: 23,        // ALT / 2nd layer
    delay_level: 24,        // ALT / 2nd layer
    ring_modulation: 25,    // ALT / 2nd layer
    filter_bandwidth: 26,   // ALT / 2nd layer
    delay_feedback: 27,     // ALT / 2nd layer
    tap: 28,
    synth_mode: 29,
    synth_waveshape: 30
};

/*
const _off_when_zero = function (v) {
    return v === 0 ? 'OFF' : v;
};
*/

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

const _filter_type = function (v) {
    if (v < 4) {
        return "ladder LP";
    } else if (v < 33) {
        return "ladder BP";
    } else if (v < 60) {
        return "ladder HP";
    } else if (v < 88) {
        return "state var. LP";
    } else if (v < 116) {
        return "state var. BP";
    } else {
        return "state var. HP";
    }
};

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
        return "triggered";
    } else {
        return "follower";
    }
};

const _synth_mode = function (v) {
    if (v < 32) {
        return "dry";
    } else if (v < 64) {
        return "mono";
    } else if (v < 96) {
        return "arp";
    } else {
        return "poly";
    }
};

const _waveshape = function (v) {
    if (v < 64) {
        return "sawtooth";
    } else {
        return "square";
    }
};

export function defineControls() {

    control[control_id.exp_pedal] = { // 4,
        name: "Exp pedal",
        human: _0_100,
        infos: "The expression pedal works by morphing between two complete settings of all of the knob values (even the second layer knob values)."
    };
    control[control_id.envelope_type] = { // 9,
        name: "Envelope type",
        human: _env_type,
        map_raw: _2_steps,
        sysex: {
            offset: 22,
            mask: [0x7F]
        },
        infos: "Changes the Filter Envelope from Triggered Envelope to Envelope Follower."
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
        infos: "Disables processing and passes the input through to the output."
    };
    control[control_id.tempo] = { // 15,
        name: "Tempo",
        human: _tempo_ms,
        sysex: {
            offset: 25,
            mask: [0x7F]
        },
        infos: "Sets the time for the delay line and arpeggiated Synth."
    };
    control[control_id.pitch] = { // 16,
        name: "Pitch",
        init_value: 63,
        cc_center: [63, 64],
        human: _pitch,
        sysex: {
            offset: 9,
            mask: [0x7F]
        },
        sysex2: {
            offset: 26,
            mask: [0x7F]
        },
        infos: "Changes the pitch of the Synth or Dry signal in half step increments."
    };
    control[control_id.filter] = { // 17,
        name: "Filter",
        init_value: 127,
        human: _percent,
        sysex: {
            offset: 10,
            mask: [0x7F]
        },
        sysex2: {
            offset: 27,
            mask: [0x7F]
        },
        infos: "Changes the cutoff frequency of the filter."
    };
    control[control_id.mix] = { // 18,
        name: "Mix",
        init_value: 127,
        human: _percent,
        sysex: {
            offset: 11,
            mask: [0x7F]
        },
        sysex2: {
            offset: 28,
            mask: [0x7F]
        },
        infos: "Adjusts the balance between Dry and Wet signals."
    };
    control[control_id.sustain] = { // 19,
        name: "Sustain",
        human: _percent,
        sysex: {
            offset: 12,
            mask: [0x7F]
        },
        sysex2: {
            offset: 29,
            mask: [0x7F]
        },
        infos: "Increases the sustain of Synth notes (Compresses the input in Dry Mode)."
    };
    control[control_id.filter_envelope] = { // 20,
        name: "Filter envelope",
        human: _filter_env,
        sysex: {
            offset: 13,
            mask: [0x7F]
        },
        sysex2: {
            offset: 30,
            mask: [0x7F]
        },
        infos: "Sets attack and decay rates for the Triggered Envelope; sets the direction and sensitivity for the Envelope Follower."
    };
    control[control_id.modulation] = { // 21,
        name: "Modulation",
        human: _off_when_zero_percent,
        sysex: {
            offset: 14,
            mask: [0x7F]
        },
        sysex2: {
            offset: 31,
            mask: [0x7F]
        },
        infos: "Detunes the oscillators of each Synth voice<br/>(Sets <span style='font-size: small'>the amount</span> of delay modulation in Dry mode)."
    };
    control[control_id.portamento] = { // 22,
        name: "Portamento",
        human: _percent,
        sysex: {
            offset: 15,
            mask: [0x7F]
        },
        sysex2: {
            offset: 32,
            mask: [0x7F]
        },
        infos: "Smoothly glide from one Synth note to another (Bends the pitch using the filter envelope as a modifier in Dry Mode)."
    };
    control[control_id.filter_type] = { // 23,
        name: "Filter type",
        human: _filter_type,
        map_raw: _filter_type_values,
        sysex: {
            offset: 16,
            mask: [0x7F]
        },
        sysex2: {
            offset: 33,
            mask: [0x7F]
        },
        infos: "Select between 6 filter types (from Min to Max) : 1. Ladder Lowpass 2. Ladder Shelving Bandpass 3. Ladder Highpass 4. State Variable Lowpass 5. State Variable Bandpass 6. State Variable Highpass."
    };
    control[control_id.delay_level] = { // 24,
        name: "Delay level",
        human: _percent,
        sysex: {
            offset: 17,
            mask: [0x7F]
        },
        sysex2: {
            offset: 34,
            mask: [0x7F]
        },
        infos: "Sets the level of a single delay tap from Min to Mid. After the Midpoint, this control blends in a second stereo tap."
    };
    control[control_id.ring_modulation] = { //  25,
        name: "Ring modulation",
        human: _percent,
        sysex: {
            offset: 18,
            mask: [0x7F]
        },
        sysex2: {
            offset: 35,
            mask: [0x7F]
        },
        infos: "Changes the frequency of a classic ring modulator. The filter envelope as a modifier."
    };
    control[control_id.filter_bandwidth] = { // 26,
        name: "Filter Resonance",
        human: _percent,
        sysex: {
            offset: 19,
            mask: [0x7F]
        },
        sysex2: {
            offset: 36,
            mask: [0x7F]
        },
        infos: "Changes the filter from a wide bandwidth for gentle filtering to a narrow bandwidth for peaky filtering."
    };
    control[control_id.delay_feedback] = { // 27,
        name: "Delay feedback",
        human: _percent,
        sysex: {
            offset: 20,
            mask: [0x7F]
        },
        sysex2: {
            offset: 37,
            mask: [0x7F]
        },
        infos: "Sets the repeats for the delay line."
    };
    control[control_id.tap] = { // 28,
        name: "Tap",
        // no_init: true,
        init_value: 0,
        no_randomize: true,
        map_raw: () => 127,
        infos: "Sets the time for the delay line and arpeggiated Synth."
        // sysex: {
        //     offset: 22,
        //     mask: [0x7F]
        // }
    };
    control[control_id.synth_mode] = { // 29,
        name: "Synth mode",
        init_value: 63,
        human: _synth_mode,
        map_raw: _4_steps,
        sysex: {
            offset: 23,
            mask: [0x7F]
        },
        infos: "Poly: Multi-Voice Synthesizer with polyphonic chord tracking Mono: Single Voice Dual Osc Synth w/monophonic tracking Arp: Turns your chords into se-  quenced patterns linked to the tap tempo Dry: Disables the Synth. Allows the filter, delay and pitch shift to be applied to the input signal."
    };
    control[control_id.synth_waveshape] = { // 30
        name: "Waveshape",
        init_value: 0,
        human: _waveshape,
        map_raw: _2_steps,
        sysex: {
            offset: 24,
            mask: [0x7F]
        },
        infos: "Changes the Synth waveshape from Sawtooth to Square."
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
