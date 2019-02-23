
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

