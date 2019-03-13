import {log} from "./debug";
import MODEL from "./model";
import {requestGlobalSettings, sendSysex} from "./midi_out";
import {hideDefaultPanel, showDefaultPanel} from "./ui";
import {closeAppPreferencesPanel} from "./ui_app_prefs";
import {setStatus} from "./ui_messages";
import {closeHelpPanel} from "./ui_help";

const CONTAINER = "#global-settings";
// const MENU_ENTRY = "#menu-global";

/*
export function toggleGlobalSettingsPanel() {
    const main = $("#main");
    closeAppPreferencesPanel();
    if (main.is(".settings-view")) {
        closeAppPreferencesPanel();
        closeSettingsPanel();
        showDefaultPanel();
        $(MENU_ENTRY).parent(".menu-entry").removeClass("menu-active");
    } else {
        main.removeClass("main-default").addClass("settings-view");
        $(CONTAINER).removeClass("closed");
        $(MENU_ENTRY).parent(".menu-entry").addClass("menu-active");
    }
    return false;   // disable the normal href behavior when called from an onclick event
}
*/

export function openGlobalSettingsPanel() {
    hideDefaultPanel();
    closeAppPreferencesPanel();
    closeHelpPanel();
    $(CONTAINER).removeClass("closed");
    setStatus("Request global settings");
    requestGlobalSettings();
    // updateGlobalConfig() will be called by the sysex handler after having received the global conf sysex response.
    return false;
}

export function closeGlobalSettingsPanel() {
    $(CONTAINER).addClass("closed");
    return false;
}

export function setupGlobalSettings() {
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
    return true;
}

/**
 * Update the UI from the MODEL controls values.
 */
export function updateGlobalSettings() {
    log("updateGlobalSettings()");
    for (let i=0; i < MODEL.global_conf.length; i++) {
        const g = MODEL.global_conf[i];
        $(`#global-${g.id}-${g.value}`).prop('checked', true);
    }
    log("updateGlobalSettings done");
}
