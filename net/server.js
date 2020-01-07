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
     * @fires Server#started 
     */
    constructor(options = {}) {
        super();
        /**
         * @name entities
         * @type {Entity[]}
         */
        this.entities = [];
        /**
         * @name players
         * @type {Player[]}
         */
        this.players = [];
        this.port = options.port || 3000;
        /**
         * @name spawn
         * @type {SpawnObject}
         */
        this.spawn = options.spawn || {
            x:256,y:256,r:0
        }
        this.eid = -1;
        this.tickNum = 0;
        // setInterval(() => {
        //     this.emit("tick", this.tickNum++);
        // }, 1/60);
        this._server = net.createServer((socket) => {
            let player = new Player(this, ++this.eid, socket);
            this.players.push(player);
            this.players.forEach(element => {
                console.log(player.id,element.id)
                if (player.id == element.id) return;
                player.send(element.createDataFormat());
            });
            /**
             * @event Server#player
             * @param {Player} player
             */
            this.emit("player", player);
            socket.on("error",(err)=>{
                console.error(err);
                //this.emit("error",player,err);
            })
            socket.on("close",()=>{
                //if (iserr) console.error("damn it do be like that sometimes");
                console.error("well whatever seeya");
                player.broadcast(player.destroyDataFormat())
                let pi = this.players.indexOf(player);
                if (pi > -1) this.players.splice(pi,1);
            })
            socket.on("data", (data) => {
                let bp = new BinaryParser(data);
                let len = bp.uint16();
                //console.log(len);
                let op = bp.uint16();
                //if (op != 0) console.log(op,op==7?"itemuse":"notitemuse");
                switch (op) {
                    case 0://player movement
                        this.emit("move", player, bp.double(), bp.double(), bp.int16());
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
                        console.log("used item");
                        this.emit("useitem",player,bp.uint8());
                        break;
                }
            })
        })
        this._server.on("error",(err)=>{
            console.error(err);
            this.emit("error",player,err);
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
        for(let player of this.players){
            player.send(buffer);
        }
    }  
    //for documentation stuff
    /**
    * @param {eventsDef} args
    */
    addListener(...args) {
        super.addListener(...args);
    }
 
   /**
    * @param {eventsDef} args
    */
    on(...args) {
        super.on(...args);
    }
    /**
     * @param {Entity} entity
     */
    addEntity(entity){
        this.entities.push(entity);
        this.broadcast(entity.createDataFormat())
    }
}
/**
 * @typedef {["started" | "listen" | "move" | "useitem", ...any[]]} eventsDef
 */
/**
 * @event Server#started
 * @type {Player|boolean}
 */
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