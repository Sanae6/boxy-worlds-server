const net = require("./net/index");
const server = new net.Server();
const Chunk = net.Chunk;
const Box = net.Box;
const Arrow = require("./net/entities/arrow")
const provider = new (require("./net/dictprovider"))();

server.on("listen",(port)=>{
    console.log("Listening on port",port)
});
server.on("started",(player,dbg)=>{
    if (dbg)console.log("player is in debug mode");
    for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++){
        player.sendChunk(provider.getChunk(x,y,1));
    }
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