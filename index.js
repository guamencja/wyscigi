// the whole server logic is based on old wyscigi pociagow server
const express = require("express");
const ws = require("ws");

const { Logger } = require("./logger/logger");
const isDebug = true;
const log = new Logger(isDebug);

// init and run express server
const app = express();
app.use(express.static("public"));

// for compatibility with old wyscigi pociagow
app.get("/api/join_room", (_, res) => {
    res.send({"ok":true,"message":""});
})
app.get("/api/create_room", (_, res) => {
    res.send({room_id:null});
})

app.listen(671, () => {
    log.info(`Unfair Monopoly is running on port 671`)    
});

// init and run websocket server
const server = new ws.Server({
    port: 171,
});
server.on("listening", () => log.info(`Unfair Monopoly's WebSocket server is running on port 171`));

// state manager
const { State } = require("./state")
const state = new State(log);

// ws handling
const { Player } = require("./player");
server.on("connection", (socket) => {
    // the game is trying to connect with the server

    // upgrade the socket to player
    const player = new Player(socket, log);

    socket.on("message", (payload) => handleCommand(player, payload));
    socket.on("close", () => {
        // remove the player bound with the socket from the game state
        log.debug(`${player.nickname} has left the game. removing them from the game state...`)
        player.room.announce("roomChat", `${player.nickname} wychodzi.`);
        state.leaveRoom(player);
    });
});

// command handling
const { Wyscigi } = require("./wyscigi");
const handleCommand = (player, payload) => {
    // todo: this can crash when malformed data is sent
    let msg = JSON.parse(payload);

    switch (msg.type) {
        case "hello": // sent when someone wants to join a room
            hello(player, msg);
            break;
        
        // wyscigi pociagow specific
        case "host_start": 
            host_start(player);
            break;

        // unfair-monopoly specific
        // todo

        default:
            log.warn(`an unhandled command "${msg.type}" was called. ignoring.`)
    }
}

const hello = (player, msg) => {
    let { name, join_id: room_id } = msg;
    if (!name) return player.alertMessage("error: nie podano nazwy.");
    log.debug(`${name} is trying to create a/join the room ${room_id}`);

    // todo: xss proof
    player.nickname = name;

    const room = state.joinRoom(player, room_id);
    player.send("roomCode", room.id);
    room.announce("roomChat", `${player.nickname} dołącza.`);

}

const host_start = (player) => {
    // can only be used by the host
    const r = player.room; // can't name it room because vscode is yelling at me
    if (player !== r.host) return log.debug(`${player.nickname} tried to start the game besides not being a host. ${r.host.nickname} is the host. ignoring.`);
    if (r.players.length < 2) {
        player.alertMessage("potrzeba co najmniej 2 graczy. znajdź sobie znajomego do gry, bo tak zbytnio to nie działa samemu.");
        return log.debug(`${player.nickname} tried to start the game besides there being less than 2 players (${r.players.length}).`);
    }
    if (r.gameStarted) return;
    r.announce("roomStarted", true)

    const game = new Wyscigi(r, log);
    game.start();
}