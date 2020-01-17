const Chunk = require("./chunk");
const Box = require("./box");
const Provider = require("./provider");
const msg = require("messagepack");
const path = require("path");
let njs = require("noisejs");
const sp = new (require("cli-spinner")).Spinner();
const async = require("async")
let Noise = njs.Noise;
const {mkdirSync,writeFileSync,readFileSync,existsSync,readdirSync,writeFile,rmdirSync} = require("fs");
/**
 * @name noiseLevels
 * @type {njs[]}
 */
let noiseLevels = [];
for(let z=0;z<10;z++){//one for elevation, one for block choice
    noiseLevels[z] = new Noise();
}
function noisefn(x,y,z){
    return noiseLevels[z].perlin2(x,y);
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
            global.genconf = this.genconf;
            boxtypes = this.genconf.boxes;
        }
        if (!existsSync(`worlds/${name}`)){
            mkdirSync(`worlds/${name}/chunks`,{recursive:true});//end goal is to have the ${name} and chunk folders
            this.mapdata = {
                seed: seed == undefined ? Math.random() : seed*12/13,
                name,
                structures: []
            }
            writeFileSync(`worlds/${name}/map.json`,JSON.stringify(this.mapdata));
        }else {
            this.mapdata = JSON.parse(readFileSync(`worlds/${name}/map.json`));
            console.log(this.mapdata )
            let dirs = readdirSync(`worlds/${name}/chunks`);
            console.log("loading chunk files")
            if (false)dirs.forEach((f)=>{
                if (f.endsWith(".mpk")){
                    let c = msg.decode(readFileSync(`worlds/${name}/chunks/`+f));
                    this.setChunk(new Chunk(c.cx,c.cy,c.cz,function(_cx,_cy,x,y,_z){
                        return new Box(c.boxtype[16*x+y],x,y,c.boxtype[16*x+y]);
                    }))
                }
            })
        }
        this.xo = false;
        for(let z=0;z<10;z++){
            noiseLevels[z].seed(this.mapdata.seed+z);
        }
        this.generate();
        setInterval(()=>{
            //this.save();
        },(this.settings.saveMinutes || 5)*60000)
    }
    generate(){
        console.log("generating terrain");
        for(var cx=-10;cx<=10;cx++)for(var cy=-10;cy<=10;cy++)for(var cz=0;cz<10;cz+=2){
            this.genChunk(cx,cy,cz);
        }
        //this.save();
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
                        let a = biome["tertiaries"].length-1;//zero indexed
                        let r = irandom(0,a);
                        let b = biome["tertiaries"][r];
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
    getSettings(){

    }
    save(){
        let e=0;
        sp.start();
        writeFileSync(`worlds/${name}/map.json`,JSON.stringify(this.mapdata));
        sp.setSpinnerTitle("saving "+Math.floor((++e/this.chunkMap.size)*100)+"%");
        async.eachOf(this.chunkMap,(c,ae,cb)=>{
            let chunk = c[1];
            let key = c[0];
            writeFile(`worlds/${this.name}/chunks/`+key.replace(",",".")+".mpk",chunk.saveFormat(),(a)=>{
                if (a)cb(a);
                sp.setSpinnerTitle("saving "+Math.floor((++e/this.chunkMap.size)*100)+"%");
                cb();
            });//mpk = messagepack
        },(e)=>{
            if (e){
                console.error(e);
                process.exit(1);
            }
            sp.setSpinnerTitle("saved!");
            sp.stop();
            setTimeout(()=>{sp.stop(true)},3000);
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
        //console.log("blockset",x,y,z)
        if (!this.hasChunk(Math.floor(x/16),Math.floor(y/16),z)) return;
        let box = this.getBlock(x,y,z);
        let chunk = this.getChunkAtPos(x,y,z);
        Object.assign(box,settings);
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
        data.writeUInt8(+box.wall,22)
        for(let player of this.server.players){
            if (!player.sentChunks.has(chunk.cx+","+chunk.cy+","+chunk.cz))continue;
            player.send(data);
        }
    }
}
module.exports = MapProvider;