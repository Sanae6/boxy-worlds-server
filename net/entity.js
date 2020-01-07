let Server = require("./server");

class Entity{
    /**
     * 
     * @param {number} type 
     * @param {number} x 
     * @param {number} y
     * @param {number} z
     * @param {number} health
     * @param {number} facing
     * @param {number} id 
     * @param {Server} server
     */
    constructor(type,x,y,z,health,facing,id,server){
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;
        this.hp = health
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
        let da = Buffer.alloc(33)
        da.fill(0,0)
        da.writeUInt16LE(2,0);
        da.writeUInt8(this.type,2);
        da.writeUInt32LE(this.id,3)
        da.writeDoubleLE(this.x,7);
        da.writeDoubleLE(this.y,15);
        da.writeDoubleLE(this.f,23);
        da.writeInt16LE(this.hp,31);
        console.log("creating",this.id,this.type)
        return da;
    }
    moveDataFormat(){
        let da = Buffer.alloc(32);
        da.writeUInt16LE(3,0);
        da.writeUInt32LE(this.id,2);
        da.writeDoubleLE(this.x,6);
        da.writeDoubleLE(this.y,14);
        da.writeDoubleLE(this.f,22);
        da.writeInt16LE(this.hp,30);
        //console.log("moving",this.id);
        return da;
    }
    destroyDataFormat(shouldKill = false){
        let da = Buffer.alloc(7);
        da.writeUInt16LE(6,0);
        da.writeUInt32LE(this.id,2);
        da.writeUInt8(+shouldKill,6);
        return da;
    }
    //todo maybe
    //position, health, id
}
module.exports = Entity;