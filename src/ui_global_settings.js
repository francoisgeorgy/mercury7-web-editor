import {log} from "./debug";
import MODEL from "./model";
import {requestGlobalSettings, sendSysex} from "./midi_out";

/*
const CONTAINER = "#global-settings";

export function openGlobalSettingsPanel() {
    hideDefaultPanel();
    closeAppPreferencesPanel();
    closeHelpPanel();
    $(CONTAINER).removeClass("closed");
    appendMessage("Request global settings");
    requestGlobalSettings();
    // updateGlobalConfig() will be called by the sysex handler after having received the global conf sysex response.
    return false;
}

export function closeGlobalSettingsPanel() {
    $(CONTAINER).addClass("closed");
    return false;
}
*/

/*
export function toggleGlobalSettingsPanel() {
    if ($(CONTAINER).is(".closed")) {
        openGlobalSettingsPanel();
    } else {
        closeGlobalSettingsPanel();
        showDefaultPanel();
    }
    return false;
}
*/

export function setupGlobalSettings() {
    // warn("setupGlobalSettings: TODO: v1.5");


    $('#refresh-global-settings').click(() => {
        requestGlobalSettings();
        return false;
    });

    $('#toggle-global-lock').click(() => {
        log('#toggle-global-lock click');
        const unlock = $("#global-lock-opened");
        const lock = $("#global-lock-closed");
        if (unlock.is(".closed")) {
            log('unlock is closed');
            lock.addClass("closed");
            unlock.removeClass("closed");

            $('.global-setting-toggle').addClass('enabled');

        } else {
            log('unlock is NOT closed');
            unlock.addClass("closed");
            lock.removeClass("closed");

            $('.global-setting-toggle').removeClass('enabled');

        }
        return false;
    });

    $(".global-setting-toggle").click((e) => {

        if ($("#global-lock-opened").is('.closed')) {
            log("locked, ignore");
            return false;
        }

        const setting_number = parseInt(e.currentTarget.id.split("-")[1]);

        // console.log(e.currentTarget.id, setting_number);

        const c = $(e.currentTarget).children('.value-127');
        const off = c.is('.hidden');
        // console.log(c, off);

        let value;
        if (off) {
            value = 127;
            // console.log("make on");
            $(e.currentTarget).children('.value-0').addClass('hidden');
            $(e.currentTarget).children('.value-127').removeClass('hidden');
        } else {
            value = 0;
            // console.log("make off");
            $(e.currentTarget).children('.value-0').removeClass('hidden');
            $(e.currentTarget).children('.value-127').addClass('hidden');
        }

        log(`setupGlobalSettings: ${setting_number}=${value}`);
        sendSysex(MODEL.getSysexDataForGlobalConfig(setting_number, value));

        return false;
    });

    /*

    log("setupGlobalSettings()");

    $(".close-settings-panel").click(() => {
        closeGlobalSettingsPanel();
        showDefaultPanel();
    });

    $("input[type='radio'].global-config").on("change", function(c) {
        const setting_number = parseInt(c.target.name.split("-")[1]);
        if (isNaN(setting_number)) {
            log("setupGlobalSettings: invalid setting number", c.target.name);
            return false;
        }
        const value = parseInt(c.target.value);
        if (isNaN(value)) {
            log("setupGlobalSettings: invalid value", c.target.value);
            return false;
        }
        log(`setupGlobalSettings: ${setting_number}=${value}`);
        sendSysex(MODEL.getSysexDataForGlobalConfig(setting_number, value));
    });
*/
    // return true;
}

/**
 * Update the UI from the MODEL controls values.
 */
export function updateGlobalSettings() {

    log("updateGlobalSettings()");

    for (let i=0; i < MODEL.global_conf.length; i++) {
        const g = MODEL.global_conf[i];

        if (g.value) {
            $(`#global-${g.id} span.value-0`).addClass('hidden');
            $(`#global-${g.id} span.value-127`).removeClass('hidden');
        } else {
            $(`#global-${g.id} span.value-0`).removeClass('hidden');
            $(`#global-${g.id} span.value-127`).addClass('hidden');
        }

    }

    // for (let i=0; i < MODEL.global_conf.length; i++) {
    //     const g = MODEL.global_conf[i];
    //     $(`#global-${g.id}-${g.value}`).prop('checked', true);
    // }

    log("updateGlobalSettings done");

}
