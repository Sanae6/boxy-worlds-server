const Chunk = require("./chunk");
const Box = require("./box");
const Provider = require("./provider");
let njs = require("noisejs");
let Noise = njs.Noise;
const {mkdirSync,writeFileSync,readFileSync,existsSync} = require("fs");

class MapProvider extends Provider{
    /**
     * 
     * @param {string} name 
     * @param {string|number} seed 
     */
    constructor(name,seed){
        super();

        if (!existsSync(`worlds/${name}`)){
            mkdirSync(`worlds/${name}`,{recursive:true});
            this.mapdata = {
                seed: seed == undefined ? Math.random() : seed,
                name
            }
            /**
             * @name noise
             * @type {njs}
             */
            this.noise = new Noise(this.mapdata.seed);
            writeFileSync(`worlds/${name}/map.json`,JSON.stringify(this.mapdata));
        }else {
            this.mapdata = JSON.parse(readFileSync(`worlds/${name}/map.json`));
            this.noise = new Noise(this.mapdata.seed);
        }
        this.generate();
    }
    generate(){
        for(var cx=-10;cx<10;cx++)for(var cy=-10;cy<10;cy++)for(var cz=0;cz<5;cz++){
            if (this.hasChunk()) continue;
            console.log(cx,cy,cz);

            this.setChunk(new Chunk(cx,cy,cz,(cx,cy,x,y)=>{this.perlin(cx,cy,x,y)}));
        }
    }
    /**
     * Runs perlin generation on the provided variables
     * @returns {Box}
     * @param {number} cx 
     * @param {number} cy 
     * @param {number} x 
     * @param {number} y 
     */
    perlin(cx,cy,x,y){
        let height = this.noise.perlin2((cx*16+x)/1000,(cy*16+y)/1000);
        if (height < -0.1) return new Box(3,x,y,true);
        if (height > -0.1 && height < 0.1) return new Box(0,x,y,false);
        return new Box(1,x,y,false)
    }
}
module.exports = MapProvider;