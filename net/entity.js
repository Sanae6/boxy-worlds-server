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
        this._tainted = true;
    }

    /**
     * abstract function 
     */
    step(){

    }

    dataFormat(){
        if (this._tainted){
            this.data.fill(0,0)
            this.data.writeUInt16LE(2,0);
            this.data.writeUInt8(this.type,2);
            this.data.writeUInt32LE(this.id,3)
            this.data.writeDoubleLE(this.x,7);
            this.data.writeDoubleLE(this.y,15);
            this.data.writeDoubleLE(this.f,23);
            this.data.writeDoubleLE(this.r,31);
            this.data.writeInt16LE(this.health,39);
            this._tainted = false;
        }
        return this.data;
    }

    //todo maybe
    //position, health, id
}
module.exports = Entity;