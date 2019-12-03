const net = require("./net/index");
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
function checkerboard(x,y){
    if ((isEven(y)&&!isEven(x))||(isEven(x)&&!isEven(y)))return new Box(1,x,y);
    else return new Box(isEven(y)?0:2,x,y);
}
let x=-4;
while (x<=4){
    let y=-4;
    while(y<=4){
        chunks.set(x+","+y,new Chunk(x,y,checkerboard))
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
    player.sendEntity(new Arrow(player,++server.eid))
});
server.on("move",(player,x,y,f,d)=>{
    //console.log("moved",x,y,f,d)
    player.x = x;
    player.y = y;
    player.f = f;
    player.r = d;
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