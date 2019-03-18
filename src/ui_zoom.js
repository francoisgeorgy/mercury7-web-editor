import {savePreferences} from "./preferences";

let zoom_level = 1;     // 0 = S, 1 = M, 2 = L

function applyZoom() {
    $("#wrapper").removeClass("zoom-0 zoom-1 zoom-2").addClass(`zoom-${zoom_level}`)
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

export function initZoom(level) {
    zoom_level = level;
    applyZoom();
}
