import {log} from "@utils/debug";
import * as lity from "lity";
import store from "storejs";
import MODEL from "@model";
import {device_name} from "@device/model";
import * as Utils from "@utils";
import {SYSEX_END_BYTE, SYSEX_PRESET, validate} from "@model/sysex";
import {resetExp} from "@shared/expController";
import {
    fullUpdateDevice,
    getMidiOutputPort,
    isCommOk,
    isFullReadInProgress,
    requestAllPresets,
    setAutoLockOnImport,
    writePreset
} from "@midi/midiOut";
import {getCurrentZoomLevel} from "@shared/windowSize";
import {toHexString} from "@utils";
import {setPresetSelectorDirty} from "@shared/presets";
import JSZip from "jszip";
import {saveAs} from 'file-saver';
import {preferences, savePreferences} from "@shared/preferences";
import {updateControls} from "@shared/controller";
import {LOCAL_STORAGE_KEY_LIBRARY} from "@device/model";
import {disableKeyboard} from "@shared/keyboardSupport";

/* editor presets (library) */

let read_presets_dialog = null;
let edit_preset_dialog = null;
let copy_presets_dialog = null;
let please_connect_dialog = null;

let library = [];

export function setupPresetsLibrary() {

    // $("#menu-download-sysex").click(downloadLastSysEx);
    $('#library-toggle-scroll').click(toggleScroll);

    $("#please-connect-close-button").click(closePleaseConnectDialog);

    $("#menu-compact-library").click(compactTheLibrary);
    $("#menu-delete-presets").click(deleteAllPresets);
    $("#menu-download-sysex").click(() => exportSysex(Object.values(library)));
    $("#menu-load-preset").click(loadPresetFromFile);

    $("#preset-file").change((event) => {
        readFiles(event.target.files);
    });     // in load-presets-dialog

    library.fill(null, 0, 15);

    readPresetsFromLocalStorage();

    if (preferences.library_open) {
        openLibrary();
    } else {
        closeLibrary();
    }

    const lib = $('#presets-lib');
    const toggle = $('#library-toggle-scroll');
    if (preferences.library_scroll) {
        log("scroll on");
        lib.addClass('scrollable');
        toggle.removeClass('inactive');
    } else {
        log("scroll off");
        lib.removeClass('scrollable');
        toggle.addClass('inactive');
    }

    $('#library-toggle').click(toggleLibrary);
    // $('#library-toggle').click(() => {
    //     if ($("#library").is(".closed")) {
    //         openLibrary()
    //     } else {
    //         closeLibrary();
    //     }
    //     return false;
    // });

    $('#edit-preset-cancel-button').click(cancelEditPreset);
    $('#edit-preset-save-button').click(updatePresetAndCloseDialog);

    $("#menu-copy-to-device").click(openCopyToDeviceDialog);
    $('#copy-presets-go-button').click(copyToDevice);
    $('#copy-presets-cancel-button').click(closeCopyToDeviceDialog);
    $('#copy-presets-close-button').click(closeCopyToDeviceDialog);

    $("#menu-import-device").click(openImportFromDeviceDialog);
    $('#read-presets-go-button').click(importPresetsFromDevice);
    $('#read-presets-cancel-button').click(closeImportPresetsDialog);
    $('#read-presets-close-button').click(closeImportPresetsDialog);

    $("#menu-bookmark").click(addCurrentSettingsAsPresetToLibrary);
    $("#menu-add-preset").click(addCurrentSettingsAsPresetToLibrary);

    displayPresets();
}

function openPleaseConnectDialog() {
    please_connect_dialog = lity("#please-connect-dialog");
}

function closePleaseConnectDialog() {
    if (please_connect_dialog) please_connect_dialog.close();
}

function closeLibrary() {
    $("#library").addClass("closed");
    $("#library-menu").addClass("closed");
    $("#library-toggle-label").text("Open library");
    // $('#library-toggle-scroll').hide();
    $('#library-toggle-scroll-wrapper').addClass("hidden");
    savePreferences({library_open: 0});
}

function openLibrary() {
    $("#library").removeClass("closed");
    $("#library-menu").removeClass("closed");
    $("#library-toggle-label").text("Close library");
    // $('#library-toggle-scroll').show();
    $('#library-toggle-scroll-wrapper').removeClass("hidden");
    savePreferences({library_open: 1});
}

export function toggleLibrary() {
    if ($("#library").is(".closed")) {
        openLibrary()
    } else {
        closeLibrary();
    }
    return false;
}

export function toggleScroll() {
    const lib = $('#presets-lib');
    const toggle = $('#library-toggle-scroll');
    if (lib.is('.scrollable')) {
        lib.removeClass('scrollable');
        toggle.addClass('inactive');
        savePreferences({library_scroll: 0});
    } else {
        lib.addClass('scrollable');
        toggle.removeClass('inactive');
        savePreferences({library_scroll: 1});
    }
}

export function addPresetToLibrary(preset, select = false) {

    log('addPresetToLibrary', preset, select);

    // add into first empty slot
    let newIndex;
    const i = library.findIndex(e => (e === null) || (typeof e === 'undefined'));
    if (i >= 0) {
        library[i] = preset;
        newIndex = i;
    } else {
        library.push(preset);
        newIndex = library.length - 1;
    }

    savePresetsInLocalStorage();
    displayPresets();

    if (select) markLibraryPresetAsSelected(newIndex)
}

function readPresetsFromLocalStorage() {

    log("readPresetsFromLocalStorage", LOCAL_STORAGE_KEY_LIBRARY)

    const s = store.get(LOCAL_STORAGE_KEY_LIBRARY);

    log("readPresetsFromLocalStorage", s)

    // log(s);
    library = s ? JSON.parse(s) : Array(16).fill(null) ;
    // log(library);
}

function savePresetsInLocalStorage() {
    // Object.assign(preferences, preferences, options);
    store(LOCAL_STORAGE_KEY_LIBRARY, JSON.stringify(library));
}

function deleteAllPresets() {
    if (!window.confirm(`Delete all library presets ?`)) return;
    // library = Array(16).fill(null);
    library = library.filter(e => e && e.locked);
    compactTheLibrary();
    savePresetsInLocalStorage();
    displayPresets();
}

function compactTheLibrary() {
    library = library.filter(e => e);
    for (let i = library.length; i < 16; i++) {
        library.push(null);
    }
    savePresetsInLocalStorage();
    displayPresets();
}

//=============================================================================
// Read all presets from Device

export function updateImportPresetsProgress(min, max, progress) {
    const p = (progress - min + 1) / (max - min + 1) * 100;
    $('#read-presets-progress')
        .css('background', `linear-gradient(to right, var(--read-preset-progress-bg1) ${p}%, var(--read-preset-progress-bg2) ${p}%)`)
        .css('color', 'var(--read-preset-progress-color)')
        .text(progress === max ? '100% - Done, you can close this window' : `${Math.round(p)}%`);  //.text(`${min} ${max} ${progress}`);
}

function openImportFromDeviceDialog() {
    if (!getMidiOutputPort()) {
        openPleaseConnectDialog();
        return;
    }
    $('#read-presets-progress').text('Click READ button to start');
    $('#read-presets-cancel-button').show()
    $('#read-presets-go-button').show();
    $('#read-presets-close-button').hide();
    read_presets_dialog = lity("#read-presets-dialog");
}

function closeImportPresetsDialog() {
    if (read_presets_dialog) {
        read_presets_dialog.close();
    }
}

async function importPresetsFromDevice() {
    if (isFullReadInProgress()) return;
    $('#read-presets-cancel-button').hide();
    // console.log('read-presets-autolock', $('#read-presets-autolock').is(':checked'));
    setAutoLockOnImport($('#read-presets-autolock').is(':checked'));
    await requestAllPresets();
    $('#read-presets-go-button').hide();
    $('#read-presets-close-button').show();
}

//=============================================================================
// Copy presets to Device

function openCopyToDeviceDialog() {

    if (!getMidiOutputPort()) {
        openPleaseConnectDialog();
        return;
    }

    $("#copy-from-id option").remove();
    $("#copy-to-id option").remove();
    $('#copy-presets-cancel-button').show();
    $('#copy-presets-go-button').show();
    $('#copy-presets-close-button').hide();
    $('#copy-presets-dialog select').on('change', updateCopyToDeviceSummary);

    const sf = $('#copy-from-id');
    const st = $('#copy-to-id');
    let c = 0;
    for (let index=0; index < library.length; index++) {
        if (library[index] && library[index].h) {
            c = index;
            sf.append(`<option value="${index}">Lib #${index + 1}: ${library[index].name}</option>`);
            st.append(`<option value="${index}">Lib #${index + 1}: ${library[index].name}</option>`);
        }
    }

    st.val(c);

    updateCopyToDeviceSummary();

    // lity dialog without close when clicking outside. Need to close with ESC or with the close button
    // https://github.com/jsor/lity/issues/132
    copy_presets_dialog = lity("#copy-presets-dialog", {
        template: '<div class="lity" role="dialog" aria-label="Dialog Window (Press escape to close)" tabindex="-1"><div class="lity-wrap" role="document"><div class="lity-loader" aria-hidden="true">Loading...</div><div class="lity-container"><div class="lity-content"></div><button class="lity-close" type="button" aria-label="Close (Press escape to close)" data-lity-close>&times;</button></div></div></div>'
    });

    // original template:
    // template: '<div class="lity" role="dialog" aria-label="Dialog Window (Press escape to close)" tabindex="-1">
    //  <div class="lity-wrap" data-lity-close role="document">
    //      <div class="lity-loader" aria-hidden="true">Loading...</div>
    //      <div class="lity-container">
    //          <div class="lity-content"></div>
    //          <button class="lity-close" type="button" aria-label="Close (Press escape to close)" data-lity-close>&times;</button>
    //      </div>
    //  </div></div>'
}

let copyToDeviceFrom;
let copyToDeviceTo;
let copyInProgress = false;

function closeCopyToDeviceDialog() {
    if (copy_presets_dialog) {
        $("#copy-from-id option").remove();
        $("#copy-to-id option").remove();
        copy_presets_dialog.close();
    }
}

function updateCopyToDeviceSummary() {

    copyToDeviceFrom = parseInt($('#copy-from-id').children("option:selected").val(), 10);
    copyToDeviceTo = parseInt($('#copy-to-id').children("option:selected").val(), 10);

    const summary = $('#copy-presets-summary');
    summary.empty();
    let deviceId = 1;
    for (let index=copyToDeviceFrom; index <= copyToDeviceTo; index++) {
        if (deviceId <= 16 && library[index] && library[index].h) {
            summary.append(`<div>Lib #${index + 1}: ${library[index].name} ---> Device preset #${deviceId} <span id="copy-presets-done-${index}"></span></div>`);
            deviceId++;
        }
    }
}

async function copyToDevice() {

    if (copyInProgress) return;

    $('#copy-presets-cancel-button').hide();

    if (!isNaN(copyToDeviceFrom) && !isNaN(copyToDeviceTo) && (copyToDeviceFrom >= 0) && (copyToDeviceTo >= 0)) {

        log(`copyToDeviceToDevice from ${copyToDeviceFrom} to ${copyToDeviceTo}`);

        copyInProgress = true;

        let deviceId = 1;
        for (let index = copyToDeviceFrom; index <= copyToDeviceTo; index++) {
            if (deviceId > 16) {
                progress.append($('<div/>').text(`${index} : ${library[index].name} --- skipped, Device is full.`));
            } else {
                if (library[index]) {
                    log(`copy ${index}`, library[index]);
                    $(`#copy-presets-done-${index}`).html(' - copied &#x2714;');
                    let data = Utils.fromHexString(library[index].h);
                    data[4] = preferences.midi_channel;     // set device ID
                    data[8] = deviceId;                       // set preset number
                    await writePreset(deviceId, data);
                    deviceId++;
                }
            }
        }

        copyInProgress = false;
    }

    $('#copy-presets-go-button').hide();
    $('#copy-presets-close-button').show();
}

//=============================================================================
// Preset file handling

let lightbox = null;    // lity dialog

/**
 *
 */
function loadPresetFromFile() {
    $("#load-presets-error").empty();
    $("#preset-file").val("");
    lightbox = lity("#load-presets-dialog");
    return false;   // disable the normal href behavior when called from an onclick event
}

/**
 * Handler for the #preset-file file input element in #load-preset
 */
function readFiles(files) {

    // log(files, typeof files);

    const lock = $('#load-presets-autolock').is(':checked');

    const descriptions_buffer = {};

    for (const f of files) {
        let data = [];
        // let f = files[0];
        log(`read file`, f);

        if (f) {

            let reader = new FileReader();

            if (f.name.endsWith('.txt')) {

                reader.onload=function(){
                    let n = f.name.substring(0, f.name.substring(0, f.name.length-5).lastIndexOf('.')) || f.name;
                    log("sysex description:", n, reader.result);

                    //TODO: if lib contains preset 'n', add description, else keep description in buffer

                    descriptions_buffer[n] = reader.result;
                }
                reader.readAsText(f);

            } else {

                reader.onload = function (e) {
                    // noinspection JSUnresolvedVariable
                    let view = new Uint8Array(e.target.result);
                    for (let i = 0; i < view.length; i++) {
                        data.push(view[i]);
                        if (view[i] === SYSEX_END_BYTE) break;
                    }

                    const valid = validate(data);
                    if (valid.type === SYSEX_PRESET) {

                        // appendMessage(`File ${f.name} read OK`);

                        // set device ID and preset ID to 0 (to avoid selecting the preset in Device when we load the preset from the library)
                        data[4] = 0;
                        data[8] = 0;

                        //TODO: description_buffer contains description, use it

                        let n = f.name.substring(0, f.name.lastIndexOf('.')) || f.name;
                        addPresetToLibrary({
                            // id: n.replace('.', '_'), // jQuery does not select if the ID contains a dot
                            id: n,
                            name: n,
                            h: toHexString(data),
                            locked: lock
                        })

                    } else {
                        log("unable to set value from file; file is not a preset sysex", valid);
                        $("#load-presets-error").show().text(valid.message);
                    }
                };
                reader.readAsArrayBuffer(f);

            }

        }
    }

    log("file read OK");
    if (lightbox) lightbox.close();
}

function exportSysex(presets) {

    log("exportSysex");

    const zip = new JSZip();

    for (const preset of presets) {
        if (preset) {
            zip.file(`${preset.name}.syx`, Utils.fromHexString(preset.h));     // will work, JSZip accepts ArrayBuffer
            if (preset.description) {
                zip.file(`${preset.name}.syx.txt`, preset.description);
            }
        }
    }

    zip.generateAsync({type:"blob"})
        .then(function (blob) {
            saveAs(blob, device_name.toLowerCase() + "-presets.zip");
        });
}


//=============================================================================

let updateSysex = false;

function cancelEditPreset() {
    if (edit_preset_dialog) edit_preset_dialog.close();
    edit_preset_dialog = null;
    $('#edit-preset-dialog input').val("");    // reset
}

function updatePresetAndCloseDialog() {

    const index = parseInt($('#edit-preset-dialog-id').val(), 10);

    log("update editor preset", index);

    if (!isNaN(index)) {

        let name = $('#edit-preset-dialog-input').val();
        let descr = $('#edit-preset-dialog-description').val();

        // console.log("update editor preset name", id, name);
        library[index].name = name;
        library[index].description = descr;
        library[index].locked = false;

        if (updateSysex) {
            log("update editor preset sysex", index);
            library[index].h = toHexString(MODEL.getPreset());
            updateSysex = false;
            presetIsDirty = false;
            hideSaveIcon(index);
        }

        $(`#name-${index}`).text(name);

        savePresetsInLocalStorage();
    }

    if (edit_preset_dialog) edit_preset_dialog.close();
    edit_preset_dialog = null;

    $('#edit-preset-dialog input').val("");    // reset
}

function openEditPresetDialog(index, saveSysex = false) {

    log(`editPreset(${index})`);

    updateSysex = saveSysex;

    if (library[index]) {

        disableKeyboard();

        $('#edit-preset-message').text(saveSysex ?
            'This will update the name, description and definition of the preset' :
            "This will update the name and description only.");

        $('#edit-preset-dialog-id').val(index);
        $('#edit-preset-dialog-input').val(library[index].name);
        $('#edit-preset-dialog-description').val(library[index].description);

        edit_preset_dialog = lity("#edit-preset-dialog");

        // var a = "contenteditable";
        // elem.attr(a) === 'true' ? elem.attr(a,'false') : elem.attr(a, 'true');

        // elem.attr('contenteditable',!elem.attr('contenteditable'));

    }
    return false;
}

function savePreset(index) {
    log(`savePreset(${index})`);
    return openEditPresetDialog(index, true);
}

//=============================================================================

function lockPreset(index) {
    log(`lockPreset(${index})`, library);
    if (library[index]) {
        library[index].locked = true;
        // $(`#preset-${index} i.preset-lock`).removeClass('hidden');
        $(`#preset-${index} i.preset-lock`).removeClass('i-hover hidden');
        $(`#preset-${index} i.preset-lock-open`).addClass('hidden').removeClass('i-hover');
        $(`#preset-${index} i.preset-save`).removeClass('i-hover');
        $(`#preset-${index} i.preset-delete`).removeClass('i-hover');
        hideSaveIcon(index);
        savePresetsInLocalStorage();
    }
    log(`lockPreset(${index})`, library);
    return false;
}

function unlockPreset(index) {
    log(`unlockPreset(${index})`, library);
    if (library[index]) {
        library[index].locked = false;
        $(`#preset-${index} i.preset-lock`).removeClass('i-hover').addClass('hidden');
        $(`#preset-${index} i.preset-lock-open`).addClass('i-hover');
        $(`#preset-${index} i.preset-save`).addClass('i-hover');
        $(`#preset-${index} i.preset-delete`).addClass('i-hover');
        if (presetIsDirty) {
            showSaveIcon(index);
            //$(`#preset-${index} i.preset-save`).removeClass('hidden i-hover');
        }
        // $(`#preset-${index} i.preset-lock`).addClass('hidden');
        // $(`#preset-${index} i.preset-lock-open`).removeClass('hidden');
        savePresetsInLocalStorage();
    }
    log(`unlockPreset(${index})`, library);
    return false;
}

function deletePreset(index) {
    log(`deletePreset(${index})`);
    if (library[index]) {
        if (!window.confirm(`Delete library preset ${library[index].name} ?`)) return;
        // log(`deletePreset(${index})`, library[index]);
        if (!library[index].locked) {
            library[index] = null;
        }
        savePresetsInLocalStorage();
        displayPresets();
    }
    return false;
}

function addCurrentSettingsAsPresetToLibrary() {

    let name = window.prompt("Preset name");
    if (name === null) return;

    //TODO: use timestamp as key
    //TODO: display sorted by key (timestamp)

    const dt = new Date();
    if (!name) name = `${
        dt.getFullYear().toString().padStart(4, '0')}.${
        (dt.getMonth()+1).toString().padStart(2, '0')}.${
        dt.getDate().toString().padStart(2, '0')} ${
        dt.getHours().toString().padStart(2, '0')}:${
        dt.getMinutes().toString().padStart(2, '0')}:${
        dt.getSeconds().toString().padStart(2, '0')}`;

    const id = Date.now();
    // const h = updateUrl();
    const h = toHexString(MODEL.getPreset());

    addPresetToLibrary({id, name, h, locked: false}, true);
}

// function addSaveIcon(index) {
//     const preset_save = $(`<i class="fas fa-save preset-save" aria-hidden="true"></i>`).click(
//         (e) => {
//             lockPreset(index);
//             e.stopPropagation();
//         }
//     );
//     $(`preset-icons-${index}`).append(preset_save);
// }

function showSaveIcon(index) {
    if (!library[index]) return;
    log("showSaveIcon", index, library[index].locked);
    if (!library[index].locked) {
        $(`#preset-${index} i.preset-save`).removeClass("hidden i-hover");
    }
}

function hideSaveIcon(index = -1) {
    log("hideSaveIcon", index);
    if (index < 0) {
        $(`i.preset-save`).addClass("hidden");
    } else {
        $(`#preset-${index} i.preset-save`).addClass(library[index].locked ? 'hidden' : 'i-hover');
    }
}

function createPresetDOM(preset, index) {

    // preset can be null or undefined because empty slots are OK

    // log("createPresetDOM", index, preset);

    let dom;

    if (preset) {
        let displayLength;
        switch (getCurrentZoomLevel()) {
            case 1: displayLength = 18; break;
            case 2: displayLength = 20; break;
            default: displayLength = 16;
        }
        let name = preset.name;
        // if (name.length > displayLength) name = name.substring(0, displayLength) + '...';
        const preset_edit = $('<i class="fas fa-pen preset-edit i-hover" aria-hidden="true" title="Edit the name and description of the preset"></i>').click(
            (e) => {
                openEditPresetDialog(index);
                e.stopPropagation();
            }
        );
        const preset_lock = $(`<i class="fas fa-lock-open preset-lock-open ${preset.locked ? 'hidden' : 'i-hover'}" aria-hidden="true"></i>`).click(
            (e) => {
                lockPreset(index);
                e.stopPropagation();
            }
        );
        const preset_unlock = $(`<i class="fas fa-lock preset-lock ${preset.locked ? '' : 'hidden'}" aria-hidden="true"></i>`).click(
            (e) => {
                unlockPreset(index);
                e.stopPropagation();
            }
        );
        const preset_delete = $(`<i class="fas fa-trash-alt preset-delete hidden ${preset.locked ? '' : 'i-hover'}" aria-hidden="true"></i>`).click(
            (e) => {
                deletePreset(index)
                e.stopPropagation();
            });
        // const preset_save = $(`<i class="fas fa-save preset-save " aria-hidden="true" title="Update the preset definition"></i>`).click(
        // const preset_save = $(`<i class="fas fa-save preset-save ${index === currentLibPreset && presetIsDirty ? '' : 'hidden'}" aria-hidden="true" title="Update the preset definition"></i>`).click(
        const preset_save = $(`<i class="fas fa-save preset-save ${preset.locked ? 'hidden' : 'i-hover'}" aria-hidden="true" title="Update the preset definition"></i>`).click(
            (e) => {
                savePreset(index);
                e.stopPropagation();
            }
        );

        dom = $(`<div/>`, {id: `preset-${index}`, "class": `preset preset-editor ${isCommOk() ? 'comm-ok' : ''}`, "draggable": "true"}).click(() => usePreset(index))
            .append($(`<div/>`, {id: `name-${index}`, "class": "preset-name"}).text(name))
            .append($(`<div/>`, {"class": "preset-icons"})
                .append(preset_edit)
                .append(preset_delete)
                .append(preset_lock)
                .append(preset_unlock)
                .append(preset_save)
            );
                // .append(preset_info));

    } else {
        dom = $(`<div/>`, {id: `preset-${index}`, "class": 'preset preset-editor', "draggable": "true"})
            .append($(`<div class="preset-name"></div>`).html('&nbsp;'));
    }

    return dom;
}

/**
 * rebuild the html presets library
 */
function displayPresets() {

    log("displayPresets", currentLibPreset);
    log("displayPresets library", library );

    const lib = $(`<div/>`, {id: "presets-lib", "class": `presets-lib flex-grow ${preferences.library_scroll ? 'scrollable' : ''}`});

    library.forEach((preset, index) => lib.append(createPresetDOM(preset, index)));

    // display at least 16 slots:
    // for (let i = library.length; i < 16; i++) {
    //     lib.append(createPresetDOM(null, i));
    // }

    $('#presets-lib').replaceWith(lib);

    setupDnD();
}

function usePreset(index) {

    log(`usePreset(${index})`);

    const valid = MODEL.setValuesFromSysEx(Utils.fromHexString(library[index].h), true);

    if (valid.type === SYSEX_PRESET) {

        log("usePreset: sysex loaded in device");
        setPresetSelectorDirty(true);   // must be done after updateUI()

        resetExp();
        updateControls();
        fullUpdateDevice();

        presetIsDirty = false;
        markLibraryPresetAsSelected(index);

        return true;
    } else {
        log("usePreset: hash value is not a preset sysex");
    }

}

let currentLibPreset = -1;
let presetIsDirty = false;

function markLibraryPresetAsSelected(index) {
    markAllLibraryPresetsAsUnselected();
    $(`#preset-${$.escapeSelector(index)}`).addClass('sel on');
    currentLibPreset = index;
}

export function markAllLibraryPresetsAsUnselected() {
    $('.preset-editor').removeClass('sel on');
    setLibraryPresetClean();
    // hideSaveIcon();
    currentLibPreset = -1;
}

export function markCurrentLibraryPresetAsDirty() {
    log("markCurrentPresetAsDirty()", currentLibPreset);
    if (currentLibPreset >= 0) {
        presetIsDirty = true;
        showSaveIcon(currentLibPreset);
    }
}

// export function markCurrentLibraryPresetAsClean() {
//     log("markCurrentPresetAsClean()", currentLibPreset);
//     if (currentLibPreset >= 0) {
//         presetIsDirty = false;
//         // hideSaveIcon(currentLibPreset);
//         setLibraryPresetClean();
//     }
// }

let dirty_cache = false;    // setPresetDirty is called each time a control is modified. This variable is used to minimize the DOM changes.

/**
 * Remove any dirty indicator from the preset selectors
 */
export function setLibraryPresetClean() {
    log("setLibraryPresetClean()");
    hideSaveIcon();
    dirty_cache = false;
}

/**
 * Show the dirty indicator on the current preset selector
 */
export function setLibraryPresetDirty(force = false) {

    log("setLibraryPresetDirty()");

    if (!dirty_cache || force) {

        log("setLibraryPresetDirty() do");

        // mark the preset selector as dirty:

        markCurrentLibraryPresetAsDirty();

        dirty_cache = true;
    }
}


/*
function downloadLastSysEx() {

    let data = MODEL.getPreset();

    const now = new Date();
    const timestamp =
        now.getUTCFullYear() + "-" +
        ("0" + (now.getUTCMonth()+1)).slice(-2) + "-" +
        ("0" + now.getUTCDate()).slice(-2) + "-" +
        ("0" + now.getUTCHours()).slice(-2) + "h" +
        ("0" + now.getUTCMinutes()).slice(-2) + "m" +
        ("0" + now.getUTCSeconds()).slice(-2) + "s";

    const preset_num = MODEL.meta.preset_id.value;

    let shadowlink = document.createElement('a');
    shadowlink.style.display = 'none';
    shadowlink.download = `${MODEL.name.toLowerCase()}-preset${preset_num ? '-' : ''}${preset_num ? preset_num : ''}.${timestamp}.syx`;

    const blob = new Blob([data], {type: "application/octet-stream"});
    const url = window.URL.createObjectURL(blob);
    shadowlink.href = url;

    document.body.appendChild(shadowlink);
    shadowlink.click();
    document.body.removeChild(shadowlink);
    setTimeout(function() {
        return window.URL.revokeObjectURL(url);
    }, 1000);

    return false;   // disable the normal href behavior when called from an onclick event
}
*/

//=============================================================================

let dragSrcEl = null;
let dragCounter = 0;
let dragOverId = null;
let dragId = null;

function handleDragStart(e) {

    // log("drag start", this.id);

    dragId = this.id;

    this.style.opacity = '0.4';

    dragSrcEl = this;

    const index = this.id.split('-')[1];
    // log("handleDragStart index", index);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text', `${index}`);
}

function handleDragOver(e) {

    // log("handleDragOver", this, this.classList.contains('preset-editor'));

    // In order to have the drop event occur on a div element, you must cancel the ondragenter and ondragover events.
    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {

    // log('drag enter', this.id, dragId, e.target.classList.contains('preset-editor'))

    dragCounter++;

    // log("HANDLEDRAGENTER", dragCounter, this.id, dragOverId, JSON.stringify(e.target.classList));

    // In order to have the drop event occur on a div element, you must cancel the ondragenter and ondragover events.
    e.preventDefault();

    // if ((this.id !== dragId) && e.target.classList.contains('preset-editor')) {
    if (this.id !== dragId) {

        // log("ENTER", this.id, dragCounter, dragId, dragOverId, JSON.stringify(e.target.classList));
        // log("enter", this.id);

        // if (dragOverId) document.getElementById(dragOverId).classList.remove('over');

        $('#presets-lib .preset-editor').removeClass('over');
        this.classList.add('over');
        // log("add .over", this.id);
        dragOverId = this.id;
    }

}

function handleDragLeave(e) {
    dragCounter--;
    if ((this.id !== dragId) && dragCounter === 0) {    // && e.target.classList.contains('preset-editor')) {
        this.classList.remove('over');
    }
}

function handleDrop(e) {

    // log("handleDrop", dragSrcEl);

    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (dragSrcEl !== this) {

        const indexTarget = this.id.split('-')[1];
        // log("handleDrop id, index", this.id, indexTarget);

        // dragSrcEl.innerHTML = this.innerHTML;
        // this.innerHTML = e.dataTransfer.getData('text/html');
        const indexSource = e.dataTransfer.getData('text');

        [library[indexSource], library[indexTarget]] = [library[indexTarget], library[indexSource]];

    } else {
        log('ignore drop');
    }

    return false;
}

function handleDragEnd(e) {

    // log("drag end");

    this.style.opacity = '1';

    itemsDnD.forEach(function (item) {
        item.classList.remove('over');
    });

    savePresetsInLocalStorage();

    displayPresets();
}

let itemsDnD;

function setupDnD() {
    itemsDnD = document.querySelectorAll('#presets-lib .preset-editor');
    itemsDnD.forEach(function (item) {
        // log("Dnd init for", item);
        item.addEventListener('dragstart', handleDragStart, false);
        item.addEventListener('dragenter', handleDragEnter, false);
        item.addEventListener('dragover', handleDragOver, false);
        item.addEventListener('dragleave', handleDragLeave, false);
        item.addEventListener('drop', handleDrop, false);
        item.addEventListener('dragend', handleDragEnd, false);
    });
}


