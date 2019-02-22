import {log} from "./debug";
import {handleUserAction} from "./ui";

export function updateBypassSwitch(value) {
    log("updateBypassSwitch", value);
    if (value === 0) {
        $("#cc-14-0").addClass("sw-off");
        $("#cc-14-127").removeClass("sw-off");
    } else {
        $("#cc-14-127").addClass("sw-off");
        $("#cc-14-0").removeClass("sw-off");
    }
}


export function updateOptionSwitch(id, value) {
    // "radio button"-like behavior
    log(`updateOptionSwitch(${id}, ${value})`);
    let e = $("#" + id);
    if (!e.is(".on")) {   // if not already on...
        e.siblings(".bt").removeClass("on");
        e.addClass("on");
    }
}

export function updateMomentaryStompswitch(id, value) {
    if (value === 0) {
        $(`#${id}-off`).removeClass("sw-off");
        $(`#${id}-on`).addClass("sw-off");
    } else {
        $(`#${id}-off`).addClass("sw-off");
        $(`#${id}-on`).removeClass("sw-off");
    }
}


export function tapDown(id) {
    updateMomentaryStompswitch(id, 127);
    handleUserAction(...id.split("-"));
}

export function tapRelease(id) {
    updateMomentaryStompswitch(id, 0);
}



/**
 *
 */
export function setupSwitches(userActionCallback) {

    // log("setupSwitches()");

    // "radio button"-like behavior:
    $("div.bt").click(function() {
        // log(`click on ${this.id}`);
        if (!this.classList.contains("on")) {   // if not already on...
            $(this).siblings(".bt").removeClass("on");
            this.classList.add("on");
            userActionCallback(...this.id.split("-"));
        }
    });

    // toggle stompswitches:
    $(".sw").click(function() {
        this.classList.add("sw-off");
        $(this).siblings(".sw").removeClass("sw-off");
        userActionCallback(...this.id.split("-"));
    });

}

export function setupMomentarySwitches(tapDownCallback, releaseCallback) {

    // momentary stompswitches:
    $(".swm").mousedown(function() { tapDownCallback(this.id) }).mouseup(function() { releaseCallback(this.id) });

}
