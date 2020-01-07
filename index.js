const net = require("./net/index");
const Noise = require("noisejs");
const noise = new Noise("123409457");
const server = new net.Server();
const Chunk = net.Chunk;
const Box = net.Box;
const Arrow = require("./net/entities/arrow")
/**
 * @type {Map<string,Chunk>} chunks - 
 * makes my life easier when i can use visual studio code's sacred javascript intellisense 😍😍😍😍😍
 */
const chunks = new Map()
// /**
//  * Checks if the number is even
//  * @param {number} n 
//  */
let i = 0;
function isEven(n){
    return n%2 == 0;
}
function walledgardens(cx,cy,x,y){
    if ((x<7 || x>8) && (y==0 || y==15) || (y<7 || y>8) && (x==0 || x==15))return new Box(1,x,y,true);
    else return new Box(0,x,y,false);
}
//const smp = new Simplex("joe")
function perlin(cx,cy,x,y){
    let height = noise.perlin2((cx*16+x)/100,(cy*16+y)/100);
    if (height < -0.1) return new Box(3,x,y,false);
    if (height > -0.1 && height < 0.1) return new Box(0,x,y,false);
    return new Box(1,x,y,(isEven(x) && !isEven(y))||(isEven(y) && !isEven(x)))
}
let x=-4;
while (x<=4){
    let y=-4;
    while(y<=4){
        chunks.set(x+","+y,new Chunk(x,y,0,perlin))
        y++;
    }
    x++;
}


server.on("listen",(port)=>{
    console.log("Listening on port",port)
});
server.on("started",(player,dbg)=>{
    if (dbg)console.log("player is in debug mode");
    for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++){
        let chunk = chunks.get(x+","+y);
        //console.log(x,y,chunk.cx,chunk.cy)
        player.sendChunk(chunk);
        
    }
    //setTimeout(()=>player.kick("posting cringe"),10000);
});
server.on("useitem",(player,slot)=>{
    console.log(slot);
    server.addEntity(new Arrow(player,++server.eid))
});
server.on("move",(player,x,y,f)=>{
    console.log("moved",x,y,f)
    player.x = x;
    player.y = y;
    player.f = f;
    //player.setPos(0,0,0,0,0);
    player.broadcast(player.moveDataFormat());
})
server.on("tick",(tn)=>{//run any important entity stepping requirements - do NOT do collision, it'd be expensive and a massive waste of time and effort
    server.entities.forEach(entity => entity.step());
})
server.on("error",(player,err)=>{
    console.log("ow",err);
    process.exit(1);
})

server.listen();