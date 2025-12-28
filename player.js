// wrapper handling the player socket
class Player {
    nickname;

    constructor(socket, logger) {
        this.socket = socket; // todo: make it private bcs i dont remember how to do it in js

        this.log = logger;

        // init player logic
        this.room = null;
    }

    send(type, value) {
        this.socket.send(JSON.stringify({
            "type": type,
            "value": value,
        }))
    }

    alertMessage(msg) {
        this.send("alertMessage", msg);
    }
}

module.exports = {
    Player,
};