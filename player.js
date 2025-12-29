// wrapper handling the player socket
class Player {
    nickname;

    constructor(socket, logger) {
        /** @private */
        this.socket = socket;
        /** @private */
        this.log = logger;

        // init player logic
        /** @type {Room} */
        this.room = null;
    }

    /**
     * Sends data to the player.
     * @param {string} type
     * @param {*} value
     */
    send(type, value) {
        this.socket.send(JSON.stringify({
            "type": type,
            "value": value,
        }))
    }

    /**
     * Sends an alert message.
     * @param {string} msg
     */
    alertMessage(msg) {
        this.send("alertMessage", msg);
    }
}

module.exports = {
    Player,
};