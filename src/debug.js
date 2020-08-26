
export const TRACE = true;

export function log() {
    if (TRACE) console.log(...arguments);
}

export function warn() {
    console.warn(...arguments);
}
