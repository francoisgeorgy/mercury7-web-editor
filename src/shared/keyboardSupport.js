import {fromEvent} from "rxjs";
import {distinctUntilChanged, groupBy, map, merge, mergeAll} from "rxjs/operators";
import {keyDown, keyUp} from "@device/shortcutKeys";
import {log} from "@utils/debug";

export let kb_enabled = true;

export function disableKeyboard() {
    kb_enabled = false;
}

export function enableKeyboard() {
    kb_enabled = true;
}

/**
 * https://codepen.io/fgeorgy/pen/NyRgxV?editors=1010
 */
export function setupKeyboard() {

    let keyDowns = fromEvent(document, "keydown");
    let keyUps = fromEvent(document, "keyup");

    let keyPresses = keyDowns.pipe(
        merge(keyUps),
        groupBy(e => e.keyCode),
        map(group => group.pipe(distinctUntilChanged(null, e => e.type))),
        mergeAll()
    );

    keyPresses.subscribe(function (e) {
        if (e.type === "keydown") {
            keyDown(e.keyCode, e.altKey, e.shiftKey, e.metaKey, e.ctrlKey);
        } else if (e.type === "keyup") {
            keyUp(e.keyCode);
        }
    });

    log("keyboard set up");
}