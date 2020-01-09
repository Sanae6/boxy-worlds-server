const nexe = require("nexe");
nexe.compile({
    build: true,
    output:"bwserver.exe",
    ico: "icon.ico",
    targets: ["13.1.0"]
}).catch((reason)=>{
    console.error(reason);
})