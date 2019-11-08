let Server = require("./server");

class Entity{
    /**
     * 
     * @param {number} type 
     * @param {number} x 
     * @param {number} y
     * @param {number} health
     * @param {number} rotation
     * @param {number} facing
     * @param {number} id 
     * @param {Server} server
     */
    constructor(type,x,y,health,rotation,facing,id,server){
        this.type = type;
        this.x = x;
        this.y = y;
        this.hp = health
        this.r = rotation;
        this.f = facing
        this.id = id;
        this.server = server;
        this.data = Buffer.alloc(41);
        this.name = ""
    }

    /**
     * abstract function 
     */
    step(){

    }

    dataFormat(){
        if (this._tainted){
            this.data.fill(0,0,this.data.length);
            this.data.writeUInt16LE(2,0);
            this.data.writeUInt8(this.type);
            this.data.writeUInt32LE(this.id)
            this.data.writeDoubleLE(x);
            this.data.writeDoubleLE(y);
            this.data.writeDoubleLE(f);
            this.data.writeDoubleLE(r);
            this.data.writeInt16LE(health)
        }
        return Buffer.concat(this.data,Buffer.from(this.name,"ascii"));
    }

    //todo maybe
    //position, health, id
}
module.exports = Entity;