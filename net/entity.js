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
        this._tainted = true;
    }

    /**
     * abstract function 
     */
    step(){

    }

    createDataFormat(){
        let da = Buffer.alloc(41)
        da.fill(0,0)
        da.writeUInt16LE(2,0);
        da.writeUInt8(this.type,2);
        da.writeUInt32LE(this.id,3)
        da.writeDoubleLE(this.x,7);
        da.writeDoubleLE(this.y,15);
        da.writeDoubleLE(this.f,23);
        da.writeDoubleLE(this.r,31);
        da.writeInt16LE(this.hp,39);
        console.log("creating",this.id,this.type)
        return da;
    }
    moveDataFormat(){
        let da = Buffer.alloc(40);
        da.writeUInt16LE(3,0);
        da.writeUInt32LE(this.id,2);
        da.writeDoubleLE(this.x,6);
        da.writeDoubleLE(this.y,14);
        da.writeDoubleLE(this.f,22);
        da.writeDoubleLE(this.r,30);
        da.writeInt16LE(this.hp,38);
        console.log("moving",this.id);
        return da;
    }
    destroyDataFormat(){
        let da = Buffer.alloc(40);
        da.writeUInt16LE(6,0);
        da.writeUInt32LE(this.id,2);
        da.writeUInt8(0,6);
        console.log("destroyed",this.id);
        return da;
    }
    //todo maybe
    //position, health, id
}
module.exports = Entity;