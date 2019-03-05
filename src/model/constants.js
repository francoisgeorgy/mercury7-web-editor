
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
    ottobitjr: 0,
    mercury7: 1,
    polymoon: 2,
    enzo: 3
};

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
