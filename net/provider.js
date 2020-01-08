const Chunk = require("./chunk");
const Box = require("./box");

class ChunkProvider{
    constructor(){
        this.chunkMap = new Map();
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
        this.getChunkAtPos(x,y,z).get(x%16,y%16)
    };
    /**
     * @returns {Chunk}
     * @param {number} x 
     * @param {number} y
     * @param {number} z 
     */
    getChunk(x,y,z){
        this.chunkMap.get(`${x},${y},${z}`);
    };
    /**
     * @returns {Chunk}
     * @param {number} x 
     * @param {number} y
     * @param {number} z 
     */
    getChunkAtPos(x,y,z){
        this.getChunk(`${Math.floor(x/16)},${Math.floor(y/16)},${z}`);
    }
    /**
     * @param {Chunk} chunk 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    setChunk(chunk,x,y,z){
        this.chunkMap.set(`${x},${y},${z}`,chunk);
    }
    /**
     * @returns {boolean}
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    hasChunk(x,y,z){
        this.chunkMap.has(`${x},${y},${z}`);
    }
}

module.exports = ChunkProvider