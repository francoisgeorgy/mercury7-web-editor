
/*
export let padZero = function(str, len, c) {
    let s = str;
    c = c || '0';
    len = (len || 2) - s.length;
    while (s.length < len) s += c;
    return s;
};
*/

export let toHexString = function(byteArray, sep) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(sep || '')
};

export var fromHexString = function(string, sep) {
    let s = sep ? string.replace(sep, '') : string;
    if ((s.length % 2) > 0) {
        // TODO: throw an exception
        console.warn(`fromHexString: invalid hex string: ${s}`);
        return null;
    }
    let a = new Uint8Array(s.length / 2);
    for (let i=0; i < (s.length / 2); i++) {
        a[i] = parseInt(s.substr(i * 2, 2), 16);
    }
    return a;
};

export function getParameterByName(name) {
    const match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
