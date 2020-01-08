let Server = require("../server");
let Entity = require("../entity");
let Chunk = require("../chunk");
let Socket = require("net").Socket;
function irandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}
/**
 * 
 * @param {Player} r1 
 * @param {Entity} r2 
 * @param {number} dx distance surrounding the entity's point on the x axis
 * @param {number} dy distance surrounding the entity's point on the y axis
 */
function intersectRect(r1, r2, dx, dy) {
    return !(r2.x-dx > r1.x || 
             r2.x+dx < r1.x || 
             r2.y-dy > r1.y ||
             r2.y+dy < r1.y);
  }
/**
 * @name Player
 * @extends Entity
 * @description A holder class for the player's data and socket
 */
class Player extends Entity{
    /**
     * @constructor
     * @param {Server} server 
     * @param {number} id
     * @param {Socket} socket
     */
    constructor(server,id,socket){
        super(0,irandom(server.spawn.x-server.spawn.r,
            server.spawn.x+server.spawn.r),irandom(server.spawn.y-server.spawn.r,
                server.spawn.y+server.spawn.r),1,20,0,id,server);
        /**
         * @name server
         * @type {Server}
         */
        this.server = server;
        /**
         * @name socket
         * @type {Socket}
         */
        this.socket = socket;
        this.authenticated = false;
        /**
         * @name sentChunks
         * @type {Map<string,Chunk>} 
         * stole this jsdoc from the 
         */
        this.sentChunks = new Map();
        this.cx = Math.floor(this.x/512);
        this.cy = Math.floor(this.y/512);
        let start = Buffer.alloc(10);
        start.writeInt16LE(this.x,2);
        start.writeInt16LE(this.y,4);
        start.writeUInt32LE(id,6);
        console.log(start);
        this.send(start);
        this.broadcast(this.createDataFormat());
    }
    /**
     * Kicks the player with provided reason
     * @param {string} reason 
     */
    kick(reason){
        let kickme = Buffer.alloc(reason.length+3);
        kickme.writeUInt16LE(4,0);
        kickme.write(reason,2);
        kickme.writeUInt8(0,reason.length+2)
        console.log(kickme);
        this.send(kickme);
        this.socket.close();
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y
     * @param {number} z
     * @param {number} r rotation
     * @param {number} f facing 
     */
    setPos(x,y,z,r,f){
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
        this.f = f;
        this.send(this.moveDataFormat());
    }
    
    /**
     * 
     * @param {Chunk} chunk 
     */
    sendChunk(chunk){
        if (this.sentChunks.has(chunk.cx+","+chunk.cy+","+chunk.cz))return// console.log("didnt send",chunk.cx+","+chunk.cy+","+chunk.cz);
        //console.log("sent",chunk.cx+","+chunk.cy+","+chunk.cz);
        this.sentChunks.set(chunk.cx+","+chunk.cy+","+chunk.cz,chunk);
        this.send(chunk.dataFormat());
    }
    /**
     * 
     * @param {Chunk} chunk 
     */
    destroyChunk(chunk){
        if (!this.sentChunks.has(chunk.cx+","+chunk.cy+","+chunk.cz))return;
        console.log("destroyed",chunk.cx,chunk.cy,chunk.cz,this.cx,this.cy,this.z);
        this.sentChunks.delete(chunk.cx+","+chunk.cy+","+chunk.cz);
        this.send(chunk.dataDestroy());
    }

    /**
     * @param {string} name
     */
    setName(name){
        this.name = name;
        let b = Buffer.alloc(name.length+2);
        b.writeUInt16LE(2,4)
        b.write(name);
        this.server.broadcast(this,b);
    }
    /**
     * @param {Entity} e
     */
    sendEntity(e){
        if (intersectRect(this,e,1400,900))
        this.send(e.createDataFormat())
    }

    /**
     * Broadcast to everyone else in the server
     * @param {Buffer} b 
     */
    broadcast(b){
        this.server.players.forEach((player)=>{
            if (this != player) player.send(b);
        })
    }
    
    /**
     * 
     * @param {Buffer} b 
     */
    send(b){
        if (this.socket.destroyed) return;
        let buffer = Buffer.alloc(b.length+2);
        buffer.writeInt16LE(0,b.length);
        b.copy(buffer,2,0,b.length);
        //console.log(buffer,buffer.readInt16LE(2));
        this.socket.write(buffer);
    }

    
}
module.exports = Player;