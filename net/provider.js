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

    };
    /**
     * @returns {Chunk}
     * @param {number} x 
     * @param {number} y
     * @param {number} z 
     */
    getChunk(x,y,z){

    };
    /**
     * @returns {Chunk}
     * @param {number} x 
     * @param {number} y
     * @param {number} z 
     */
    getChunkAtPos(x,y,z){
        
    }
    /**
     * @param {Chunk} chunk 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    setChunk(chunk,x,y,z){}
    /**
     * @returns {boolean}
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    hasChunk(x,y,z)
}

module.exports = ChunkProvider