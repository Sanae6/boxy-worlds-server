const Chunk = require("./chunk");
const Box = require("./box");
class ChunkProvider{
    constructor(generatorfn){
        /**
         * @name chunkMap
         * @type {Map<string,Chunk>}
         */
        this.chunkMap = new Map();
    }
    /**
     * Generates the world (all chunks within range)
     */
    generate(){}
    /**
     * @returns {object} {x:num,y:num}
     */
    getSpawn(){}
    getSettings(){}
    /**
     * @returns {Box}
     * @param {number} x 
     * @param {number} y
     * @param {number} z 
     */
    getBlock(x,y,z){
        return this.getChunkAtPos(x,y,z).get(Math.abs(x<0?16+x:x)%16,Math.abs(y<0?16+y:y)%16);
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
        return this.getChunk(Math.floor(x/16),Math.floor(y/16),z);
    }
    /**
     * @param {Chunk} chunk
     * @returns {Chunk}
     */
    setChunk(chunk){
        this.chunkMap.set(`${chunk.cx},${chunk.cy},${chunk.cz}`,chunk);
        return chunk;
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
            cb(this.genChunk(x,y,z));
        }
    }
    genBox(cx,cy,x,y,z){
        return new Box(0,x,y,false);
    }
}

module.exports = ChunkProvider