const Chunk = require("./chunk");
const Box = require("./box");
/**
 * @callback init
 * @param {number} cx
 * @param {number} cy
 * @param {number} x
 * @param {number} y
 */

class ChunkProvider{
    constructor(generatorfn){
        this.chunkMap = new Map();
        /**
         * @name generatorfn
         * @type {init}
         */
        this.generatorfn = generatorfn;
    }
    /**
     * Generates the world (all chunks within range)
     */
    generate(){}
    save(){}
    load(){}
    /**
     * @returns {Box}
     * @param {number} x 
     * @param {number} y
     * @param {number} z 
     */
    getBlock(x,y,z){
        return this.getChunkAtPos(x,y,z).get(x%16,y%16)
    };
    /**
     * @returns {Chunk}
     * @param {number} x 
     * @param {number} y
     * @param {number} z 
     */
    getChunk(x,y,z){
        return this.chunkMap.get(`${x},${y},${z}`);
    };
    /**
     * @returns {Chunk}
     * @param {number} x 
     * @param {number} y
     * @param {number} z 
     */
    getChunkAtPos(x,y,z){
        return this.getChunk(`${Math.floor(x/16)},${Math.floor(y/16)},${z}`);
    }
    /**
     * @param {Chunk} chunk
     */
    setChunk(chunk){
        this.chunkMap.set(`${chunk.cx},${chunk.cy},${chunk.cz}`,chunk);
    }
    /**
     * @returns {boolean}
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    hasChunk(x,y,z){
        return this.chunkMap.has(`${x},${y},${z}`);
    }
    requestChunk(x,y,z,cb){
        if (this.hasChunk(x,y,z))cb(this.getChunk(x,y,z));
        else {
            let chunk = new Chunk(x,y,z,(cx,cy,x,y)=>{return this.generatorfn(cx,cy,x,y,z)});
            this.setChunk(chunk);
            cb(chunk);
        }
    }
}

module.exports = ChunkProvider