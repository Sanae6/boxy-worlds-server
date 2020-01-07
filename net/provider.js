const Chunk = require("./chunk");
const Box = require("./box");

class ChunkProvider{
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
    getBlock(x,y){};
    /**
     * @returns {Chunk}
     * @param {number} x 
     * @param {number} y
     * @param {number} z 
     */
    getChunk(x,y){};
}

module.exports = ChunkProvider