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
    for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++){
        provider.requestChunk(x,y,1,(chunk)=>{
            player.sendChunk(chunk)
        });
    }
});
server.on("useitem",(player,slot)=>{
    console.log(slot);
    server.addEntity(new Arrow(player,++server.eid))
});
server.on("move",(player,x,y,f)=>{
    //console.log("moved",x,y,f)
    player.x = x;
    player.y = y;
    player.f = f;
    //console.log(player.cx, Math.floor(x/16), player.cy, Math.floor(y/16))
    //player.setPos(0,0,0,0,0);
    if (player.cx != Math.floor(x/512) || player.cy != Math.floor(y/512)){
        player.cx = Math.floor(x/512);
        player.cy = Math.floor(y/512);
        player.sentChunks.forEach((chunk)=>{
            if ((chunk.cx < player.cx-5 && chunk.cx > player.cx+5)||
                (chunk.cy < player.cy-5 && chunk.cy > player.cy+5)){
                    //console.log(`${player.cx-7}<${chunk.cx}<${player.cx+7} - ${player.cy-7}<${chunk.cy}<${player.cy+7}`)
                    player.destroyChunk(chunk);
                }
        });
        for(let ix=player.cx-5;ix<=player.cx+5;ix++)for(let iy=player.cy-5;iy<=player.cy+5;iy++){
            if (!player.sentChunks.has(ix+","+iy+","+player.z)){
                provider.requestChunk(ix,iy,1,(chunk)=>{
                    player.sendChunk(chunk)
                });
            }
        }
    }
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