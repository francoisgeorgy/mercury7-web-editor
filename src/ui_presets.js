import {log} from "./debug";

let preset_number = 0;

// export function getPresetNumber() {
//     return preset_number;
// }

export function setPresetNumber(pc) {
    preset_number = pc;
}

export function displayPreset() {
    $(".preset-id").removeClass("on");
    $(`#pc-${preset_number}`).addClass("on");
}

export function presetInc(callback) {
    log("presetInc");
    callback("pc", (preset_number % 16) + 1);
    displayPreset();
}

export function presetDec(callback) {
    log("presetDec");
    preset_number--;
    if (preset_number < 1) preset_number = 16;
    callback("pc", preset_number);
    displayPreset();
}

export function setupPresetSelectors(callback) {

    log("setupPresetSelectors()");

    $("div#pc-down").click(function() {
        log(`click on ${this.id}`);
        presetDec(callback);
    });

    $("div#pc-up").click(function() {
        log(`click on ${this.id}`);
        presetInc(callback);
    });

    $("div.preset-id").click(function() {
        log(`click on ${this.id}`);
        if (!this.classList.contains("on")) {   // if not already on...
            $(this).siblings(".preset-id").removeClass("on");
            this.classList.add("on");
        }
        callback(...this.id.split("-"));
        // callback(this.id.split("-")[1]);
    });

}
