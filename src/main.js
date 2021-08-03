import {log} from "@utils/debug";
import MODEL from "@model";
import {detect} from "detect-browser";
import {loadPreferences, preferences} from "@shared/preferences";
import {setupUI, VERSION} from "@shared/appSetup";
import {initMidi} from "@midi";
import * as serviceWorker from "./serviceWorker";
import {handleUrlParameters} from "@shared/url";
import "@fontsource/roboto-condensed/300.css";
import "@fontsource/roboto-condensed/400.css";
import "@fontsource/roboto-condensed/700.css";
import "@fontsource/roboto-condensed/300-italic.css";
import "@fontsource/roboto-condensed/400-italic.css";
import "@fontsource/roboto-condensed/700-italic.css";
// CSS files order is important :
import "./shared/css/lity.min.css";
import "./shared/css/main.css";
import "./shared/css/header.css";
import "./shared/css/size.css";
import "./shared/css/config.css";
import "./shared/css/presets.css";
import "./shared/css/controls.css";
import "./shared/css/buttons.css";
import "./shared/css/dialogs.css";
import "./shared/css/global-settings.css";
// Custom CSS must come after the default shared ones.
import "./mercury7/css/controls.css";
import "./mercury7/css/themes.css";

//==================================================================================================================
// Setup the worker for the offline support (PWA):

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register(
                "./serviceWorker.js"
            )
            .then(
                res => log("service worker registered")
            )
            .catch(err => console.error("service worker not registered", err))
    })
}

//==================================================================================================================
// Check if the browser is supported:

const browser = detect();

if (browser) {
    // log(browser.name);
    // log(browser.version);
    switch (browser && browser.name) {
        case "chrome":
            break;
        case "firefox":
        case "edge":
        default:
            log("unsupported browser");
            alert("Please use Chrome browser (recent version recommended). " +
                "Any other browser is unsupported at the moment and the application may not work properly or not work at all. " +
                "Thank you for your understanding.");
    }
}

//==================================================================================================================
// Main

$(function () {

    log(`${MODEL.name} editor ${VERSION}`);

    loadPreferences();

    MODEL.init();
    MODEL.setDeviceId(preferences.midi_channel - 1);   // the device_id is the midi channel - 1

    setupUI();

    handleUrlParameters();

    initMidi();

});
