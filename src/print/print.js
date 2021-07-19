import MODEL from "@model";
import * as Utils from "@shared/utils";
import * as Mustache from "mustache";
import {hexy} from "hexy";
import "./print.css";
import {log} from "@utils/debug";
import {SYSEX_END_BYTE, SYSEX_PRESET} from "@model/sysex";
import {URL_PARAM_SYSEX} from "@shared/url";

function renderControlName(control_number) {
    return MODEL.control[control_number].name;
}

function renderControlValue(control_number, index = 0) {
    const c = MODEL.control[control_number];
    let s = "";
    switch (index) {
        case 0:
            s = c.human(c.raw_value);
            if (c.two_values) {
                s = s + ` (${c.human(c.raw_value2)})`;
            }
            break;
        case 1:
            s = c.human(c.raw_value);
            break;
        case 2:
            if (c.two_values) {
                s = c.human(c.raw_value2);
            }
            break;
    }
    return s;
}

function renderPreset(template, filename) {
    const t = $(template).filter("#template-main").html();
    const p = {
        "f": () => () => filename ? `(${filename})` : "",
        "id": () => () => MODEL.meta.preset_id.value ? `#${MODEL.meta.preset_id.value}` : '(unsaved)',
        "n": () => text => renderControlName(text.trim().toLowerCase()),
        "v": () => text => renderControlValue(text.trim().toLowerCase()),
        "v1": () => text => renderControlValue(text.trim().toLowerCase(), 1),
        "v2": () => text => renderControlValue(text.trim().toLowerCase(), 2)
    };
    $("body").append(Mustache.render(t, p));
}

function loadTemplate(data, filename) {
    $.get("templates/preset-template.html", function(template) {
        let ok = true;
        if (data) {
            const valid = MODEL.setValuesFromSysEx(data);
            if (valid.type !== SYSEX_PRESET) {                  //FIXME: check logic
                ok = false;
            }
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

        // const SYSEX_END = 0xF7;

        let data = [];
        log(`read file`, f.name);

        if (f) {
            let reader = new FileReader();
            reader.onload = function (e) {
                // noinspection JSUnresolvedVariable
                let view   = new Uint8Array(e.target.result);
                for (let i=0; i<view.length; i++) {
                    data.push(view[i]);
                    if (view[i] === SYSEX_END_BYTE) break;
                }

                //FIXME: check data validity here and load error template in case of error

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

    let ok = false;
    let data = null;
    const s = Utils.getParameterByName(URL_PARAM_SYSEX);
    if (s) {
        try {
            // data = Utils.fromHexString(LZString.decompressFromBase64(decodeURI(s)));
            data = Utils.fromHexString(decodeURI(s));
            const valid = MODEL.setValuesFromSysEx(data);
            if (valid.type === SYSEX_PRESET) {
                ok = true;
            }
        } catch (error) {
            console.warn(error);
        }
    }

    if (ok) {
        loadTemplate();
    } else {
        loadErrorTemplate(data);
    }

});
