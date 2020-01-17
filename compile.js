const cp = require("child_process");
const Spinner = require("cli-spinner").Spinner;
let sp = new Spinner()
sp.setSpinnerTitle("compiling the executable");
sp.start();
const fs = require("fs");
if (!fs.existsSync("build"))fs.mkdirSync("build");
cp.exec("pkg . --out-path build",(err)=>{
    if (err) console.error(err);
    sp.stop(true);
    if (!err&&process.argv[2] == "start"){
        console.log("starting the server")
        cp.execFileSync("bwserver.exe",{
            cwd:"build",
            stdio: "inherit"
        });
    }
})
