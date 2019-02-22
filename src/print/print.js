import MODEL from "../model/index.js";
import * as Utils from "../utils.js";
import * as Mustache from "mustache";
import {hexy} from "hexy";
import "./print.css";
import {URL_PARAM_SYSEX} from "./../constants";
import {log} from "../debug";

function renderControlName(control_number) {
    return MODEL.control[control_number].name;
}

function renderControlValue(control_number) {
    const c = MODEL.control[control_number];
    return c.human(c.raw_value);
}

function renderPreset(template, filename) {
    const t = $(template).filter("#template-main").html();
    const p = {
        "f": () => () => filename ? `(${filename})` : "",
        "id": () => () => MODEL.meta.preset_id.value ? `#${MODEL.meta.preset_id.value}` : '(unsaved)',
        "n": () => text => renderControlName(text.trim().toLowerCase()),
        "v": () => text => renderControlValue(text.trim().toLowerCase())
    };
    $("body").append(Mustache.render(t, p));
}

function loadTemplate(data, filename) {
    $.get("templates/preset-template.html", function(template) {
        // let d = null;
/*
        if (data) {
            for (let i=0; i<data.length; i++) {
                if (data[i] === 240) {
                    if (d) {
                        if (MODEL.setValuesFromSysEx(d)) {
                            renderPreset(template);
                        } else {
                            console.warn("unable to update device from sysex");
                        }
                    }
                    d = [];
                }
                d.push(data[i]);
            }
        }
*/
        let ok = false;
        if (data) {
            ok = MODEL.setValuesFromSysEx(data)
        } else {
            ok = true;
        }
        if (ok) {
            renderPreset(template, filename);
        } else {
            console.warn("invalid data");
        }
    });
}

function loadErrorTemplate(data) {

    $.get("templates/preset-template.html", function(template) {

        const t = $(template).filter("#template-error").html();

        $("body").append(Mustache.render(t, {dump: data ? hexy(Array.from(data), {format:"twos"}) : "no data"}));

        $("#cmds").text("");

        $("#print").click(function(){
            window.print();
            return false;
        });

    });
}

$(function () {

    $("#print").click(function(){
        window.print();
        return false;
    });

    /**
     * Handler for the #preset-file file input element in #load-preset
     */
    function readFile(f) {

        const SYSEX_END = 0xF7;

        let data = [];
        log(`read file`, f.name);

        if (f) {
            let reader = new FileReader();
            reader.onload = function (e) {
                // noinspection JSUnresolvedVariable
                let view   = new Uint8Array(e.target.result);
                for (let i=0; i<view.length; i++) {
                    data.push(view[i]);
                    if (view[i] === SYSEX_END) break;
                }
                loadTemplate(data, f.name);
            };
            reader.readAsArrayBuffer(f);
        }
    }

    const dropZone = document.getElementById('dropzone');

    function showDropZone() {
        dropZone.style.display = "block";
    }

    function hideDropZone() {
        dropZone.style.display = "none";
    }

    function allowDrag(e) {
        // if (true) {  // Test that the item being dragged is a valid one
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
        // }
    }

    function handleDrop(e) {
        e.preventDefault();
        hideDropZone();
        $(".title").remove();
        $(".columns").remove();
        const dt = e.dataTransfer;
        const files = dt.files;
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            readFile(file);
        }
    }

    window.addEventListener('dragenter', showDropZone);
    dropZone.addEventListener('dragenter', allowDrag);
    dropZone.addEventListener('dragover', allowDrag);
    dropZone.addEventListener('dragleave', hideDropZone);
    dropZone.addEventListener('drop', handleDrop);

    MODEL.init();

    let valid = false;
    let data = null;
    const s = Utils.getParameterByName(URL_PARAM_SYSEX);
    if (s) {
        try {
            // data = Utils.fromHexString(LZString.decompressFromBase64(decodeURI(s)));
            data = Utils.fromHexString(decodeURI(s));
            valid = MODEL.setValuesFromSysEx(data);
        } catch (error) {
            console.warn(error);
        }
    }

    if (valid) {
        loadTemplate();
    } else {
        loadErrorTemplate(data);
    }

});
