const Box = require("./box");
const MAX_UINT32 = 0xFFFFFFFF;
/**
 * @callback init
 * @param {number} cx
 * @param {number} cy
 * @param {number} x
 * @param {number} y
 */
/**
 * @class
 * @name Create
 */
class Chunk{
    /**
     * 
     * @param {number} cx
     * @param {number} cy
     * @param {number} cz
     * @param {init} initialize 
     */
    constructor(cx,cy,cz,initialize){
        /**
         * @type {Array<Box>}
         * @name boxes
         */
        this.boxes = [];
        this.cx = cx;
        this.cy = cy;
        this.cz = cz;
        /**
         * @type {Buffer}
         * @name data
         */
        this.data = Buffer.alloc(2+17+512);
        this._tainted = true;//check if chunk data should be rebuilt
        this.te = [];//tile entities or dynamic boxes, boxes that are also instances basically
        if (typeof(initialize)!='function') initialize = this._defaultInit;
        for(let x=0;x<16;x++)for(let y=0;y<16;y++)this.boxes.push(initialize(this.cx,this.cy,x,y));
    }
    _defaultInit(x,y){
        return new Box(1,x,y,false);
    }
    set(x,y,id){
        this.boxes[x*y].id = id;
    }
    /**
     * a sendable buffer with the chunk data opcode, both x and y values, and the boxes with it.
     * @returns {Buffer}
     */
    dataFormat(){
        if (this._tainted){
            this.data.fill(0,0,this.data.length);
            this.data.writeUInt16LE(1,0);
            this.data.writeInt32LE(this.cx >> 8,2);
            this.data.writeInt32LE(this.cx & 0xff,6);
            this.data.writeInt32LE(this.cy >> 8,10);
            this.data.writeInt32LE(this.cy & 0xff,14);
            this.data.writeUInt8(this.cz,18);
            
            //console.log(this.data);
            
            let i=19;
            if (this.boxes.length != 256) throw new Error("LOL");
            for(let box of this.boxes){
                box.data(i++,this.data)
                i++;
            }
        }
        return this.data;
    }
}
module.exports = Chunk