const net = require("net");
const Player = require("./entities/player")
const Entity = require("./entity")
const EventEmitter = require("events");
const BinaryParser = require('binary-buffer-parser');
/**
 * @typedef ConstructorObject
 * @property
 */
/**
 * @typedef SpawnObject
 * @property {number} x
 * @property {number} y
 * @property {number} r
 */
/**
 * @class
 * @name Server
 */
class Server extends EventEmitter {
    /**
     * @param {Object} options 
     */
    constructor(options = {}) {
        super();
        /**
         * @name entities
         * @type {Entity[]}
         */
        this.entities = [];
        this.players = [];
        this.port = options.port || 3000;
        /**
         * @name spawn
         * @type {SpawnObject}
         */
        this.spawn = options.spawn || {
            x:0,y:0,r:5
        }
        this.eid = -1;
        this.tickNum = 0;
        setInterval(() => {
            this.emit("tick", this.tickNum++);
        }, 20);
        this._server = net.createServer((socket) => {
            let player = new Player(this, ++this.eid, socket);
            this.players.push(player);
            /**
             * @event Server#player
             * @param {Player} player
             */
            this.emit("player", player);
            socket.on("error",(err)=>{
                console.error(err);
                this.emit("error",player,err);
            })
            socket.on("data", (data) => {
                let bp = new BinaryParser(data);
                let len = bp.uint16();
                console.log(len);
                let op = bp.uint16();
                console.log(op);
                switch (op) {
                    case 0://player movement
                        this.emit("move", player, bp.double(), bp.uint8() == 1 ? true : false);
                        break;
                    case 1://set name
                        this.emit("login", player, bp.string0(), bp.uint8()==1?bp.string0():false);
                        break;
                    case 2://set password - should only be used during authentication
                        this.emit("setpw",player,bp.string0());
                        break;
                    case 3://debug message
                        console.log(bp.string0());
                        break;
                    case 4://the player is leaving without a crash of some sort
                        socket.close()
                        this.emit("close",player,bp.string0());
                        break;
                    case 5://starting 
                        bp.uint8();//serverside debug mode disable
                        let dbg = false;
                        if (dbg)setTimeout(()=>{
                            this.emit("started",player,true);
                        },500);
                        else this.emit("started",player,false);
                        break;
                    case 6:
                        this.emit(bp.uint8()?"reqchunk":"delchunk",(bp.int32()<<8)|(bp.int32()&0xFF)
                        ,(bp.int32()<<8)|(bp.int32()&0xFF));
                        break;
                    case 7:
                        this.emit("useitem",player,bp.uint8());
                        break;
                }
            })
        })
    }
    listen(port = this.port) {
        this._server.listen(port, () => {
            this.emit("listen", port);
        });
    }
    /**
     * sends a lengthless buffer to all players
     * @param {Buffer} buffer
     */
    broadcast(buffer){
        
    }
}

/**
 * @event Server#tick
 * @type {object}
 * @property {number} tickcount
 */
/**
 * @event Server#move
 * @type {object}
 * @property {Player} player
 */
module.exports = Server;