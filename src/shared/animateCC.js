import {log} from "@utils/debug";

let animations = {};     // one entry possible per CC; entry is {timeout_handler, target_value}

function doOneStep(control_number, n, callback) {

    if (n === animations[control_number].to) {
        clearTimeout(animations[control_number].handler);
        animations[control_number] = null;
        return;
    }

    n < animations[control_number].to ? n++ : n--;

    callback(n);

    //FIXME: use setInterval instead of setTimeout
    animations[control_number].handler = setTimeout(() => doOneStep(control_number, n, callback), 1000/60);
}

function stopAnimateCC(control_number) {
    clearTimeout(animations[control_number].handler);
    animations[control_number] = null;
}

export function startAnimateCC(control_number, from, to, callback) {
    log(`animateCC(${control_number}, ${from}, ${to})`);
    if (animations[control_number]) {
        if (animations[control_number].to === to) {
            stopAnimateCC(control_number);
        } else {
            animations[control_number].to = to;     // change direction
        }
    } else {
        animations[control_number] = {
            handler: null,
            to: to
        };
        doOneStep(control_number, from, callback);
    }
}
