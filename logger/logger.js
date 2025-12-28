// a small, custom logger because i don't like console.log
const { bgBlueBright, bgYellowBright, bgRed, gray } = require("picocolors");

const o = new Intl.DateTimeFormat("en-GB", { // datetime format Options
    dateStyle: "short",
    timeStyle: "long",
    timeZone: "Europe/Warsaw",
});

const STATES = {
    INFO: bgBlueBright("INFO"),
    WARN: bgYellowBright("WARN"),
    ERROR: bgRed("ERROR"),
    DEBUG: gray("DEBUG"),
}

class Logger {
    constructor(isDebug) {
        this.isDebug = isDebug;
    }

    log(state, ...elements) {
        const now = Date.now();
        console.log(`${o.format(now)} ${state} ${elements.join(" ")}`);

        // todo: write to a file
    }

    info(...el) {
        this.log(STATES.INFO, el);
    }

    warn(...el) {
        this.log(STATES.WARN, el);
    }

    error(...el) {
        this.log(STATES.ERROR, el);
    }

    debug(...el) {
        if(!this.isDebug) return;
        this.log(STATES.DEBUG, el);
    }
}

module.exports = {
    Logger
}