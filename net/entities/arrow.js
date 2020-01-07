const Entity = require("../entity");
const Player = require("./player");
class Arrow extends Entity{
    /**
     * 
     * @param {Player} 
     * 
     * 
     * 
     * @param {number}
     */
    constructor(owner,id){
        super(1,owner.x,owner.y,0,0,owner.f,id,owner.server);
        setTimeout(()=>{
            this.server.broadcast(this.destroyDataFormat(false))
        },5000)
    }
}
module.exports = Arrow