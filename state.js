const { Room } = require("./room");

class State {
    constructor(logger) {
        this.log = logger;

        // init state manager
        this.rooms = new Map();
    }

    // history on why it's one: creating a room was a whole another command, but it was never used anyway, 
    // because joinRoom had the same behaviour when the specified room wasn't there so it didn't have to handle exceptions
    getOrCreateRoom(roomId) {
        let room = this.rooms.get(roomId);
        if (!room) {
            room = new Room(this.log);
            this.rooms.set(room.id, room);
            this.log.debug(`room ${room.id} has been created`);
        }
        return room;
    }

    joinRoom(player, room_id) {
        const room = this.getOrCreateRoom(room_id);
        room.addPlayer(player);
        // the specified room_id isn't guaranteed to join, return the joined room
        return room
    }

    leaveRoom(player) {
        if (!player.room) return this.log.warn("player is trying to leave a room besides not being in one. ignoring.");

        const room = player.room;
        room.removePlayer(player);

        if (room.players.length === 0) {
            this.rooms.delete(room.id);
            this.log.debug(`room ${room.id} has been destroyed`)
        }
    }
}

module.exports = {
    State,
};