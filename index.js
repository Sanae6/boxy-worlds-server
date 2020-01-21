//boxy worlds - a top down sandbox exploration game made for a game design class

//logging override
(function (){
    let fs = require("fs");
    let util = require("util")
    let log = console.log;
    let ol = fs.createWriteStream("output.log");
    let el = fs.createWriteStream("error.log");
    console.log = function(){
        let args = Array.from(arguments);
        args.unshift({ colors: true })
        ol.write(util.format.apply(undefined,arguments)+"\n");
        log.call(console,util.formatWithOptions.apply(undefined,args))
    }
    let err = console.error;
    console.error = function(){
        let args = Array.from(arguments);
        args.unshift({ colors: true })
        el.write(util.format.apply(undefined,arguments)+"\n");
        err.call(console,util.formatWithOptions.apply(undefined,args))
    }
})();

const provider = new (require("./net/dictprovider"))("world");
const Server = require("./net/server")
const server = new Server({provider,isLocal: process.argv[2] == "local"});
const Chunk = require("./net/chunk");
const Box = require("./net/box");
const Spider = require("./net/entities/spider")
const net = require("net");
const ifaces = require("os").networkInterfaces();
console.log("\nPOSSIBLE IP ADDRESSES\n=====================")
Object.keys(ifaces).forEach((ifname)=>{//from the nodejs docs
    let alias = 1;
    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }
        console.log(ifname, iface.address);
    });
});
console.log("\nHave the person you want to join type this into their join bar\n");
server.on("listen",(port)=>{
    console.log("Listening on port",port)
    console.log("Boxy Worlds Server v1.0");
    server.addEntity(new Spider(++server.eid,server,-256,-256,0));
});
server.on("started",(player,dbg)=>{
    if (dbg)console.log("player is in debug mode");
    for(let x=-4;x<=4;x++)for(let y=-4;y<=4;y++){
        provider.requestChunk(x,y,1,(chunk)=>{
            player.sendChunk(chunk);
        });
    }
    server.entities.forEach((e)=>player.send(e.createDataFormat()))
});
server.on("useitem",(player,slot,bx,by)=>{
    //finally fixing chunk destruction player.destroyChunk(provider.getChunkAtPos(bx,by,player.z));
    //testing placement for(let x=-2;x<=1;x++)for(let y=-2;y<=1;y++)provider.setBlock(bx+x,by+y,player.z,{id:1,wall:false})
    //early arrow shoot testing server.addEntity(new Arrow(player,++server.eid))
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
            if ((chunk.cx < player.cx-4 || chunk.cx > player.cx+4)||
                (chunk.cy < player.cy-4 || chunk.cy > player.cy+4)){
                    //console.log(chunk.cx,chunk.cy)
                    player.destroyChunk(chunk);
                }
        });
        for(let ix=player.cx-4;ix<=player.cx+4;ix++)for(let iy=player.cy-4;iy<=player.cy+4;iy++){
            if (!player.sentChunks.has(ix+","+iy+","+player.z)){
                provider.requestChunk(ix,iy,1,(chunk)=>{
                    player.sendChunk(chunk)
                });
            }
        }
    }
    player.broadcast(player.moveDataFormat());
})
server.on("tick",()=>{//run any important entity stepping requirements - do NOT do collision, it'd be expensive and a massive waste of time and effort
    server.entities.forEach(entity => entity.step());
})
server.on("placebox",(player,box,ise,x,y)=>{
    if (ise){
        server.entities.push(new (require("./net/entities/static"))(box,++server.eid,player.x,player.y,player.z,server))
    }else{
        provider.setBlock(player.x,player.y,player.z,{wall: (box/2%2)==0,id:box});
    }
})
server.on("error",(player,err)=>{
    console.error(
        `Caught exception: ${err}\n`
    );
})
process.on('uncaughtException', (err, origin) => {
    console.error(
        `Caught exception: ${err}\n` +
        `Exception origin: ${origin}`
    );
    console.log("kicking players!")
    server.players.forEach((player)=>{
        player.kick(`Server error!#${err.message}`);
    });
    console.log("saving before quit");
    server._server.close();
    provider.save(()=>{
        console.log("quitting!")
        process.exit(1);
    });
});

process.on("exit",()=>{
    console.log('Press any key to exit');

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
})
server.listen();