import {savePreferences} from "@shared/preferences";

let zoom_level = 1;     // 0 = S, 1 = M, 2 = L

export function isPWAorFullscreen() {
    // return true;
    return ["fullscreen", "standalone", "minimal-ui"].some(
        (mode) => window.matchMedia('(display-mode: ' + mode + ')').matches
    );
}

export function getCurrentZoomLevel() {
    return zoom_level;
}

function applyZoom() {
    $("body").removeClass("size-0 size-1 size-2").addClass(`size-${zoom_level}`)
    if (isPWAorFullscreen()) {
        // console.log("pwa");
        $("body").addClass('pwa');
    } else {
        $("body").removeClass('pwa');
    }
}

export function zoomIn() {
    if (zoom_level === 2) return;
    zoom_level++;
    savePreferences({zoom_level});
    applyZoom();
    return false;
}

export function zoomOut() {
    if (zoom_level === 0) return;
    zoom_level--;
    savePreferences({zoom_level});
    applyZoom();
    return false;
}

export function initSize(level) {
    zoom_level = level;
    applyZoom();
}
