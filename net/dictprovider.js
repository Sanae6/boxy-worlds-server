const Chunk = require("./chunk");
const Box = require("./box");
const Provider = require("./provider");
const msg = require("messagepack");
const path = require("path");
let njs = require("noisejs");
const sp = new (require("cli-spinner")).Spinner();
const async = require("async")
const Structure = require("./structure")
let Noise = njs.Noise;
const {mkdirSync,writeFileSync,readFileSync,existsSync,readdirSync,writeFile,rmdirSync} = require("fs");
/**
 * @name noiseLevels
 * @type {njs[]}
 */
let noiseLevels = [];
for(let z=0;z<15;z++){//one for elevation, one for block choice
    noiseLevels[z] = new Noise();
}
function noisefn(x,y,z){
    return noiseLevels[z].simplex2(x,y);
}
const divfactor = 200;
function noise(cx,cy,x,y,z){
    return (noisefn((cx*16+x)/divfactor,(cy*16+y)/divfactor,z));
    //return Math.abs(noisefn((cx*16+x)/divfactor,(cy*16+y)/divfactor,z)
    //    + 0.5 * noisefn((cx*16+x)/divfactor,(cy*16+y)/divfactor,z)
    //    + 0.25 * noisefn((cx*16+x)/divfactor,(cy*16+y)/divfactor,z));
}
/**
 * @returns {number}
 * @param {number} min 
 * @param {number} max 
 */
function irandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}
/**
 * @global
 * @type {Array<string>}
 */
var boxtypes = [];
boxtypes = boxtypes;
class MapProvider extends Provider{
    /**
     * 
     * @param {string|number} seed
     */
    constructor(seed){
        super();
        //rmdirSync("worlds",{recursive:true}); delete the worlds folder
        if (!existsSync("settings.json"))writeFileSync("settings.json",readFileSync(path.join(__dirname,"..","dsettings.json")));
        this.settings = JSON.parse(readFileSync("settings.json"));
        let name = this.settings["world-name"]
        this.name = name;
        if(this.settings.generator == "default"){
            this.genconf = JSON.parse(readFileSync(__dirname+"/../dworldgen.json"))
        }else {
            if (!existsSync(`${this.settings.generator}.json`)){
                console.error(`${this.settings.generator}.json doesn't exist, defaulting to main world generator`)
                this.genconf = JSON.parse(readFileSync(__dirname+"/../dworldgen.json"))
            }else this.genconf = JSON.parse(readFileSync(`${this.settings.generator}`))
        }
        global.genconf = this.genconf;
        /**
         * @name structureMap
         * @type {Map<string,Structure>}
         */
        this.structureMap = new Map();
        for(let gens of this.genconf.floorgens){
            for(let satructu of gens.structures){
                if (!this.structureMap.has(satructu.file)){
                    this.structureMap.set(satructu.file,new Structure(satructu.file));
                }
            }
        }
        boxtypes = this.genconf.boxes;
        if (!existsSync(`worlds/${name}`)){
            mkdirSync(`worlds/${name}/chunks`,{recursive:true});//end goal is to have the ${name} and chunk folders
            this.mapdata = {
                seed: seed==null||seed==undefined ? Math.random() : seed*12/13,
                name,
                structures: []
            }
            writeFileSync(`worlds/${name}/map.json`,JSON.stringify(this.mapdata));
        }else {
            this.mapdata = JSON.parse(readFileSync(`worlds/${name}/map.json`));
            console.log(this.mapdata )
            if (existsSync(`worlds/${name}/chunks`)){
                let dirs = readdirSync(`worlds/${name}/chunks`);
                console.log("loading chunk files")
                if (!this.settings.quickstart)dirs.forEach((f)=>{
                    if (f.endsWith(".mpk")){
                        let c = msg.decode(readFileSync(`worlds/${name}/chunks/`+f));
                        this.setChunk(new Chunk(c.cx,c.cy,c.cz,function(_cx,_cy,x,y,_z){
                            return new Box(c.boxtype[16*x+y],x,y,c.boxtype[16*x+y]);
                        }))
                    }
                })
            }else {
                mkdirSync(`worlds/${name}/chunks`,{recursive:true});
            }
        }
        this.xo = false;
        for(let z=0;z<15;z++){
            noiseLevels[z].seed(this.mapdata.seed+z);
        }
        this.generate();
        setInterval(()=>{
            //this.save();
        },(this.settings.saveMinutes || 5)*60000)
    }
    generate(){
        console.log("generating terrain");
        for(var cx=-30;cx<=30;cx++)for(var cy=-30;cy<=30;cy++)for(var cz=0;cz<15;cz+=3){
            this.genChunk(cx,cy,cz);
        }
        return;//god this code sucks ass, i'm totally rewriting this entire server in another language
        for(var cx=-30;cx<=30;cx++)for(var cy=-30;cy<=30;cy++)for(var cz=0;cz<15;cz+=3){
            let wh = noisefn(cx,cy,cz+1);//which structure to check against
            if (wh > 0.7) {
                let st = noisefn(cx/divfactor,cy/divfactor,cz+2);//whether to use the structure
                let rnd = (wh-(1/this.structureMap.size))/(1/0.7) * this.structureMap.size;
                let struct = this.structureMap.get(Array.from(this.structureMap.keys())[Math.floor(rnd)]);
                if (struct == undefined) struct = this.structureMap.get(Array.from(this.structureMap.keys())[0]);
                let within = false;//if another structure is within the range of this chunk 
                for(let str of this.mapdata.structures){
                    if (str.struct != struct.file)continue;
                    if (str.z = cz && str.corner && (str.x <cx-5 || str.x >cx+5 || str.y <cy-5 || str.y >cy+5)){
                        within = true;
                    }
                }
                if (within)continue;
                for(let x=0;x<Math.floor(struct.w/16);x++)for(let y=0;y<Math.floor(struct.h/16);y++){
                    this.mapdata.structures.push({
                        x,y,z:cz,corner: x==0 && y==0,struct: Array.from(this.structureMap.keys())[Math.floor(rnd)]
                    })
                }
                struct.setPos(cx*16,cy*16);
                //console.log("structure at",cx,cy)
                for(let x=0;x<struct.w-1;x++)for(let y=0;y<struct.h-1;y++){
                    let box = struct.getBox(x,y);
                    if (box.id == -1) continue;
                    //console.log(x,y,box.x,box.y,box.id)
                    //this.setBlock(box.x,box.y,1,{id:box.id,wall:box.wall});
                }
            }
        }
        //this.save();
        console.log("generated terrain");
    }
    genChunk(cx,cy,cz){
        if (this.hasChunk(cx,cy,cz)) return this.getChunk(cx,cy,cz);
        let chunk = this.setChunk(new Chunk(cx,cy,cz,(cx,cy,x,y)=>{return this.genBox(cx,cy,x,y,cz)}));
        //writeFile(`worlds/${this.name}/chunks/${cx}.${cy}.${cz}`+".mpk",chunk.saveFormat(),()=>{})
        return chunk;
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
    genBox(cx,cy,x,y,z){
        let elevation = noise(cx,cy,x,y,z);
        let which = noise(cx,cy,x,y,z+1);//whether to use primary secondary or tertiary
        let biomes = global.genconf.floorgens[0].biomes;
        let hasSecondary=false,hasTertiary=false;
        let box;
        for(var i=0;i<biomes.length;i++){
            let biome = biomes[i];
            if (biome["threshold"] > elevation || i == biomes.length-1){
                if (biome["tertiaries"] != undefined)hasTertiary = true;
                if (biome["secondary"] != undefined)hasSecondary = true;
                if (which > 1.6)console.log(which);
                if ((!hasSecondary && !hasTertiary) || which < biome["primary_threshold"])box = new Box(boxtypes.indexOf(biome["primary"]),x,y,biome["primary_wall"] || false);
                else if ((hasSecondary && !hasTertiary) || which < biome["secondary_threshold"])box = new Box(boxtypes.indexOf(biome["secondary"]),x,y,biome["secondary_wall"] || false);
                else {
                    if (biome["tertiaries"].length == 1) box = new Box(boxtypes.indexOf(biome["tertiaries"][0]));
                    else {
                        let oop = biome["secondary_threshold"] == undefined ? biome["primary_threshold"] : biome["secondary_threshold"]
                        let a = biome["tertiaries"].length-1;//zero indexed
                        let r = (which-(1/biome["tertiaries"].length))/(1-oop);//an attempt at feature scaling, now noise dependent xd
                        let b = biome["tertiaries"][Math.floor(r*biome["tertiaries"].length)];
                        if (b == undefined)b = biome["tertiaries"][0];
                        box = new Box(boxtypes.indexOf(b.box),x,y,b.wall || false);
                    }
                }
                return box;
            }
        }
    }
    getSpawn(){
        return {x:256,y:256}
    }
    save(ceb){
        let e=0;
        sp.start();
        writeFileSync(`worlds/${this.mapdata.name}/map.json`,JSON.stringify(this.mapdata));
        sp.setSpinnerTitle("saving "+Math.floor((++e/this.chunkMap.size)*100)+"%");
        async.eachOfLimit(this.chunkMap,4,(c,ae,cb)=>{
            let chunk = c[1];
            let key = c[0];
            writeFile(`worlds/${this.name}/chunks/`+key.replace(",",".")+".mpk",chunk.saveFormat(),(a)=>{
                if (a)cb(a);
                sp.setSpinnerTitle("saving "+Math.floor((++e/this.chunkMap.size)*100)+"%");
                cb();
            });
        },(e)=>{
            if (e){
                console.error(e);
                process.exit(1);
            }
            sp.setSpinnerTitle("saved!");
            sp.stop();
            setTimeout(()=>{
                sp.stop(true)
                if (typeof(ceb) == "function")ceb();
            },3000);
        })
    }
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {object} settings
     * @param {boolean} settings.wall
     * @param {number} settings.id
     */
    setBlock(x,y,z,settings){
        console.log("blockset",x,y,z,settings.id,settings.wall)
        let chunk
        if (!this.hasChunk(Math.floor(x/16),Math.floor(y/16),z)) chunk = this.genChunk(Math.floor(x/16),Math.floor(y/16),z);
        else chunk = this.getChunkAtPos(x,y,z);
        let box = this.getBlock(x,y,z);
        Object.assign(box,settings);
        if (this.server == undefined)return;
        //writeFile(`worlds/${this.name}/chunks/`+chunk.toString().replace(",",".")+".mpk",chunk.saveFormat(),(a)=>{})
        let data = Buffer.alloc(23);
        let cx = Math.floor(x/16);
        let cy = Math.floor(y/16);
        let bx = Math.abs(x<0?(16*cx)-x:x)%16;
        let by = Math.abs(y<0?(16*cy)-y:y)%16;
        data.writeUInt16LE(8,0);
        data.writeInt32LE(cx >> 8,2);
        data.writeInt32LE(cx & 0xff,6);
        data.writeInt32LE(cy >> 8,10);
        data.writeInt32LE(cy & 0xff,14);
        data.writeUInt8(z,18);
        data.writeUInt8(bx,19);
        data.writeUInt8(by,20);
        data.writeUInt8(box.id,21)
        data.writeUInt8(+box.wall,22);
        for(let player of this.server.players){
            if (!player.sentChunks.has(chunk.cx+","+chunk.cy+","+chunk.cz))continue;
            player.send(data);
        }
    }
}
module.exports = MapProvider;