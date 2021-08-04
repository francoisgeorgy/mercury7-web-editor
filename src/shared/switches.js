import {log} from "@utils/debug";

/**
 *
 * @param value
 */
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

/**
 *
 * @param id
 * @param value
 */
export function updateMomentaryFootswitch(id, value) {
    log(`updateMomentaryFootswitch(${id}, ${value})`);
    if (value === 0) {
        $(`#${id}-off`).removeClass("sw-off");
        $(`#${id}-on`).addClass("sw-off");
    } else {
        $(`#${id}-off`).addClass("sw-off");
        $(`#${id}-on`).removeClass("sw-off");
    }
}

/**
 * "radio button"-like behavior
 * @param id
 * @param value
 */
export function updateOptionSwitch(id) {
    log(`updateOptionSwitch(${id})`);
    let e = $("#" + id);
    if (!e.is(".on")) {   // if not already on...
        e.siblings(".bt").removeClass("on");
        e.addClass("on");
    }
}

/**
 *
 */
export function setupSwitches(userActionCallback) {
    log("setupSwitches()");
    //
    // "radio button"-like behavior:
    //
    // $("div.bt").click(function() {
    $("div.bt").mousedown(function() {
        // log(`click on ${this.id}`);
        if (!this.classList.contains("on")) {   // if not already on...
            $(this).siblings(".bt").removeClass("on");
            this.classList.add("on");
            userActionCallback(...this.id.split("-"));
        }
    });
    //
    // toggle stompswitches:
    //
    // $(".sw").click(function() {
    $(".sw").mousedown(function() {
        this.classList.add("sw-off");
        $(this).siblings(".sw").removeClass("sw-off");
        userActionCallback(...this.id.split("-"));
    });
}
