import MODEL from "@model";
import {updateControl} from "@shared/controller";
import {TRACE} from "@shared/utils/debug";

export function customSetup() {

    if (TRACE) console.groupCollapsed("customSetupUI");

    // nothing to do with Mercury7

    if (TRACE) console.groupEnd();
}
