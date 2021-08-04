
export const global_id = {  // Global Num (see Meris I/O doc)
    input_mode: 0,      // mono / stereo
    input_level: 1,     // instrument / line
    relay_bypass: 2,    // buffered / relay
    kill_dry: 3,        // dry active / dry muted
    trails: 4,          // trail
    tempo_select: 5    // global / preset
};

export const global_conf = new Array(6);

function defineGlobals() {

    global_conf[global_id.input_mode] = {
        name: "input_mode",
        sysex: {
            offset: 11,
            mask: [0x7F]
        }
    };
    global_conf[global_id.input_level] = {
        name: "input_level",
        sysex: {
            offset: 12,
            mask: [0x7F]
        }
    };
    global_conf[global_id.relay_bypass] = {
        name: "relay_bypass",
        sysex: {
            offset: 13,
            mask: [0x7F]
        }
    };
    global_conf[global_id.kill_dry] = {
        name: "kill_dry",
        sysex: {
            offset: 14,
            mask: [0x7F]
        }
    };
    global_conf[global_id.trails] = {
        name: "trails",
        sysex: {
            offset: 16,
            mask: [0x7F]
        }
    };
    global_conf[global_id.tempo_select] = {
        name: "tempo_select",
        sysex: {
            offset: 17,
            mask: [0x7F]
        }
    };

    // add the missing default properties
    global_conf.forEach(function (obj) {
        obj.id = global_conf.indexOf(obj);
        obj.value = 0;
    });

} // defineControls()

defineGlobals();

