import {log} from "./debug";

let animations = {};     // one entry possible per CC; entry is {timeout_handler, target_value}

function _animateCC(control_number, n, callback) {

    if (n === animations[control_number].to) {
        clearTimeout(animations[control_number].handler);
        animations[control_number] = null;
        return;
    }

    n < animations[control_number].to ? n++ : n--;

    callback(n);

    animations[control_number].handler = setTimeout(() => _animateCC(control_number, n, callback), 1000/60);
}

function _stopAnimateCC(control_number) {
    clearTimeout(animations[control_number].handler);
    animations[control_number] = null;
}

export function animateCC(control_number, from, to, callback) {
    log(`animateCC(${control_number}, ${from}, ${to})`);
    if (animations[control_number]) {
        if (animations[control_number].to === to) {
            _stopAnimateCC(control_number);
        } else {
            animations[control_number].to = to;     // change direction
        }
    } else {
        animations[control_number] = {
            handler: null,
            to: to
        };
        _animateCC(control_number, from, callback);
    }
}
