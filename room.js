// room struct
class Room {
    constructor(logger) {
        // todo: it can repeat and crash
        this.id = randomCharset();

        /** @private */
        this.log = logger;

        // init the room logic
        this.players = [];
        this.host = null;
        this.gameStarted = false;
        this.currentGame = null;
    }

    /**
     * @param {Player} player
     */
    addPlayer(player) {
        if (player.room) return this.log.warn("player is trying to join a room while already being assigned to a(nother) room. ignoring.");
        
        this.players.push(player);
        player.room = this;

        if (!this.host) {
            this.setHost(player);
        }

        if (this.gameStarted) {
            player.send("roomCode", this.id);
            player.send("roomStarted", true);
            this.currentGame.sendGameState(player);
        }
    }

    /**
     * @param {Player} player
     */
    removePlayer(player) {
        this.players = this.players.filter(p => p !== player);
        player.room = null;

        if (this.host === player) {
            this.setHost(this.players[0]);
        }
    }

    /**
     * @param {Player} player
     */
    setHost(player) {
        this.host = player;
        if (this.host) this.host.send("hostNotif", "h");
    }

    /**
     * Sends data to everyone in the room.
     * @param {string} type
     * @param {*} value
     */
    announce(type, value) {
        this.players.forEach(p => p.send(type, value));
    }
}

// stolen from https://github.com/guamencja/wyscigi/blob/master/bk.js#L18
/**
 * @returns {string} roomId
 */
function randomCharset() {
    // losowe znaki do id gier
    let kb = "qwertyuiopsdfghjklzxcvbnm".split("") //array
    let final = "";

    let dLength = 6 // zmiana tej wartości zmieni długość każdego id
    let c = 0;

    while(c !== dLength) {
        final += kb[Math.floor(Math.random() * kb.length)];
        c += 1;
    }

    final = final.toUpperCase() // jak id nie mają być dużymi literami zapisane to można to usunąć

    return final;
}

module.exports = {
    Room,
};