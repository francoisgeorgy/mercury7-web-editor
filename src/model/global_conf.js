
export const global_id = {
    input_mode: 0,
    input_level: 1,
    relay_bypass: 2,
    kill_dry: 3,
    trails: 4,
    tempo_select: 5
};

export const global_conf = new Array(6);

function defineGlobals() {

    global_conf[global_id.input_mode] = {
        name: "",
        sysex: {
            offset: 11,
            mask: [0x7F]
        }
    };
    global_conf[global_id.input_level] = {
        name: "",
        sysex: {
            offset: 12,
            mask: [0x7F]
        }
    };
    global_conf[global_id.relay_bypass] = {
        name: "",
        sysex: {
            offset: 13,
            mask: [0x7F]
        }
    };
    global_conf[global_id.kill_dry] = {
        name: "",
        sysex: {
            offset: 14,
            mask: [0x7F]
        }
    };
    global_conf[global_id.trails] = {
        name: "",
        sysex: {
            offset: 16,
            mask: [0x7F]
        }
    };
    global_conf[global_id.tempo_select] = {
        name: "",
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

