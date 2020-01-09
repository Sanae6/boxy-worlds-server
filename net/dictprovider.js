const Chunk = require("./chunk");
const Box = require("./box");
const Provider = require("./provider");
let njs = require("noisejs");
let Noise = njs.Noise;
const {mkdirSync,writeFileSync,readFileSync,existsSync} = require("fs");
/**
 * @name noiseLevels
 * @type {njs[]}
 */
let noiseLevels = [];
for(let z=0;z<5;z++){
    noiseLevels[z] = new Noise();
}
function perlintwo(x,y,z){
    return noiseLevels[z].perlin2(x,y);
}
function perlin(cx,cy,x,y,z){
    return perlintwo((cx*16+x)/100,(cy*16+y)/100,z)
        + 0.5 * perlintwo((cx*16+x)/100,(cy*16+y)/100,z)
        + 0.5 * perlintwo((cx*16+x)/100,(cy*16+y)/100,z);
}
function irandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}
class MapProvider extends Provider{
    /**
     * 
     * @param {string} name 
     * @param {string|number} seed 
     */
    constructor(name,seed){
        super(perlin);
        
        if (!existsSync(`worlds/${name}`)){
            mkdirSync(`worlds/${name}`,{recursive:true});
            this.mapdata = {
                seed: seed == undefined ? Math.random() : seed,
                name
            }
            writeFileSync(`worlds/${name}/map.json`,JSON.stringify(this.mapdata));
        }else {
            this.mapdata = JSON.parse(readFileSync(`worlds/${name}/map.json`));
        }
        for(let z=0;z<5;z++){
            noiseLevels[z].seed(this.mapdata.seed);
        }
        this.generate();
    }
    generate(){
        for(var cx=-10;cx<10;cx++)for(var cy=-10;cy<10;cy++)for(var cz=0;cz<5;cz++){
            if (this.hasChunk(cx,cy,cz)) continue;
            this.setChunk(new Chunk(cx,cy,cz,(cx,cy,x,y)=>{return this.genBox(cx,cy,x,y,cz)}));
        }
    }
    /**
     * Runs perlin generation on the provided variables
     * @returns {Box}
     * @param {number} cx 
     * @param {number} cy 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z
     */
    genBox(){
        let height = perlin(cx,cy,x,y,z)
        let box;
        if (height < -0.1) box = new Box(3,x,y,true);
        else if (height > -0.1 && height < 0.1) box = new Box(0,x,y,false);
        else box = new Box(1,x,y,false);
        return box;
    }
}
module.exports = MapProvider;