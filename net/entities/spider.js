const Entity = require("../entity");

function checkPlayerInCircle(self,p,radius){
    (p.x - self.x)^2 + (p.y - self.y)^2 <= radius^2 
}

class Spider extends Entity{
    /**
     * yeet
     * @param {number} eid 
     * @param {Server} server 
     * @param {number} x 
     * @param {number} y
     * @param {number} z
     */
    constructor(eid,server,x,y,z){
        super(5,x,y,z,10,0,eid,server);
        this.state = "wander";
    }

    step(){
        for(let p of this.server.players){
            if (checkPlayerInCircle(this,p,30)){
                this.state = checkPlayerInCircle(this,p,2) ? "attack" : "follow"
                this.target = p;
                break;
            }else {
                this.state = "wander";
                this.target = undefined;
            }
        }
        switch(this.state){
            case "attack":
                break;
            case "follow":
                break;
            default:
                this.f+=1;
                if (this.f>=360)this.f=0;
                this.moveFacing();
        }
        this.server.broadcast(this.moveDataFormat())
    }
}
module.exports = Spider;