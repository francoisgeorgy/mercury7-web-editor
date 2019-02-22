import {log} from "./debug";
import DEVICE from "./model";
import {sendSysEx} from "./midi_out";
import {hideDefaultPanel, showDefaultPanel} from "./ui";
import {closeAppPreferencesPanel} from "./ui_app_prefs";

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
    return false;   // disable the normal href behavior
}
*/

export function openSettingsPanel() {
    hideDefaultPanel();
    closeAppPreferencesPanel();
    $(CONTAINER).removeClass("closed");
    return false;
}

export function closeSettingsPanel() {
    $(CONTAINER).addClass("closed");
    return false;
}

export function setupGlobalConfig() {
    log("setupGlobalConfig()");

    $(".close-settings-panel").click(() => {
        closeSettingsPanel();
        showDefaultPanel();
    });

    $("input[type='radio'].global-config").on("change", function(c) {
        const setting_number = parseInt(c.target.name.split("-")[1]);
        if (isNaN(setting_number)) {
            console.log("setupGlobalConfig: invalid setting number", c.target.name);
            return false;
        }
        const value = parseInt(c.target.value);
        if (isNaN(value)) {
            console.log("setupGlobalConfig: invalid value", c.target.value);
            return false;
        }
        log(`setupGlobalConfig: ${setting_number}=${value}`);
        sendSysEx(DEVICE.getSysexDataForGlobalConfig(setting_number, value));
    });
    return true;
}
