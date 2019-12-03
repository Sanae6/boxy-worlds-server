const Entity = require("../entity");
const Player = require("./player");
class Arrow extends Entity{
    /**
     * 
     * @param {Player} owner 
     * @param {number}
     */
    constructor(owner,id){
        super(1,owner.x,owner.y,0,owner.f,owner.f,id,owner.server);
        this.server.broadcast(this.createDataFormat());
    }
}
module.exports = Arrow