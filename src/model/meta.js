
/*
const getStringValue = function(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] > 0) {
            s += String.fromCharCode(bytes[i]);
        }
    }
    return s;
};
*/

export default {
    signature: {
        name: "Signature",
        sysex: {
            offset: 1,
            range: [],
            mask: [0x7F, 0x7F, 0x7F],
            value: [0x00, 0x20, 0x10]  // Manufacturer ID
        }
    },
    device_id: {
        name: "Device Id",  // Prod ID (user definable, matches midi channel)
        value: 0,           // 0 = any (TO BE CONFIRMED)
        sysex: {
            offset: 4,
            range: [0, 127],
            mask: [0x7F]
        }
    },
    group_id: {
        name: "Device Id",  // Group ID (01 = pedal series)
        value: 1,
        sysex: {
            offset: 5,
            range: [0, 127],
            mask: [0x7F]
        }
    },
    model_id: {
        name: "Device Id",  // Model # (0=Ottobit Jr, 1=Mercury7, 2=Polymoon, 3=Enzo)
        value: 3,
        sysex: {
            offset: 6,
            range: [0, 127],
            mask: [0x7F]
        }
    },
    preset_id: {
        name: "Preset Number",
        value: 0,
        sysex: {
            offset: 8,
            range: [0, 127],
            mask: [0x7F]
        }
    }
};

