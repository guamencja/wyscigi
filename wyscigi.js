const reasons = ["Paliwa nalałeś na 2cm ruchu", "Powerbank wybychł", "Pociąg zapadł w depresję", "Pociąg został planetą", "pociąg nie lubił właściciela", "TheTroll zjadł koła pociągu", "pzpl zjadł ci pociąg", "liseu zjadł wagony", "Pieseł zjadł silnik"];

class Wyscigi {
    constructor(room, logger) {
        this.room = room;

        this.log = logger;

        // wyscigi pociagow variables
        this.loseChance = 0.05;
        this.driveChance = 0.7;

        this.playerPositions = {};
        this.playerLost = {};
        this.playerTrains = {};
        this.gameLoop = null;
    }

    start() {
        this.log.debug(`${this.room.id}: a game of wyscigi pociagow has started`);
        this.room.gameStarted = true;
        this.room.currentGame = this;
        this.playersPlaying = this.room.players.slice(); // a copy, so any spectators dont interfere

        // wyscigi pociagow init
        this.playersPlaying.forEach(p => {
            this.playerPositions[p.nickname] = 0;
            this.playerLost[p.nickname] = false;
            this.playerTrains[p.nickname] = Math.floor(Math.random() * 3) + 1;
        })

        this.room.announce("playerTrains", this.playerTrains);
        this.room.announce("playerPositions", this.playerPositions);

        this.gameLoop = setInterval(() => this.tick(), 1000);
    }

    // when a new spectator joins
    sendGameState(player) {
        // send the game state to the spectator
        player.send("playerTrains", this.playerTrains);
        player.send("playerPositions", this.playerPositions);
    }

    tick() {
        this.playersPlaying.forEach(p => {
            // if already lost, don't move
            if (this.playerLost[p.nickname]) return;
            
            // drive rng
            if (Math.random() <= this.driveChance) {
                this.playerPositions[p.nickname]++;
            }

            // lose rng
            if (Math.random() <= this.loseChance) {
                this.log.debug(`${this.room.id}: ${p.nickname} has lost.`)
                this.playerLost[p.nickname] = true;
                this.room.announce("roomChat", `${p.nickname} przegrał. powód: ${reasons[Math.floor(Math.random() * reasons.length)]}`);
            }
        });

        this.room.announce("playerPositions", this.playerPositions);

        // check if game is over
        if (Object.values(this.playerLost).every(p => p === true)) { // everybody lost, L
            this.log.debug(`${this.room.id}: everybody have lost.`)
            this.room.announce("roomChat", "wszyscy się wykoleili... naprawcie sobie pociągi na następny raz spk?");
            this.end();
            return;
        }

        const winner = Object.keys(this.playerPositions).find(nickname => this.playerPositions[nickname] >= 9);
        if (winner) { // someone won
            this.log.debug(`${this.room.id}: ${winner} has won.`)
            this.room.announce("roomChat", `gg ${winner}, wygrałeś!`);
            this.end();
            return;
        }
    }

    end() {
        clearInterval(this.gameLoop);
        this.log.debug(`${this.room.id}: a game of wyscigi pociagow has ended`);

        this.room.gameStarted = false;
        this.room.currentGame = null;
        this.room.host.send("hostNotif", "h");
    }
}

module.exports = {
    Wyscigi,
};