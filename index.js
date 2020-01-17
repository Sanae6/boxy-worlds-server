const provider = new (require("./net/dictprovider"))("world");
const Server = require("./net/server")
const server = new Server({provider,isLocal: process.argv[2] == "local"});
const Chunk = require("./net/chunk");
const Box = require("./net/box");
const Arrow = require("./net/entities/arrow")
console.log("Boxy Worlds Server v0.9");
server.on("listen",(port)=>{
    console.log("Listening on port",port)
});
server.on("started",(player,dbg)=>{
    if (dbg)console.log("player is in debug mode");
    for(let x=-10;x<=10;x++)for(let y=-10;y<=10;y++){
        provider.requestChunk(x,y,1,(chunk)=>{
            player.sendChunk(chunk)
        });
    }
});
server.on("useitem",(player,slot,bx,by)=>{
    for(let x=-2;x<=1;x++)for(let y=-2;y<=1;y++)provider.setBlock(bx+x,by+y,player.z,{id:1,wall:false})
    //server.addEntity(new Arrow(player,++server.eid))
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
        //console.log(player.sentChunks.size)
        player.sentChunks.forEach((chunk)=>{
            if ((chunk.cx < player.cx-5 || chunk.cx > player.cx+5)||
                (chunk.cy < player.cy-5 || chunk.cy > player.cy+5)){
                    //console.log(chunk.cx,chunk.cy)
                    //player.destroyChunk(chunk);
                }
        });
        for(let ix=player.cx-10;ix<=player.cx+10;ix++)for(let iy=player.cy-10;iy<=player.cy+10;iy++){
            if (!player.sentChunks.has(ix+","+iy+","+player.z)){
                provider.requestChunk(ix,iy,1,(chunk)=>{
                    //console.log(chunk.cx,chunk.cy)
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