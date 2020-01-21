const Entity = require("../entity");
const Server = require("../server");
class StaticEntity extends Entity{
    /**
     * Any static entity with any specific type tied to it
     * @param {number} type
     * @param {number} id
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {Server} server
     */
    constructor(type,id,x,y,z,server){
        super(type,x,y,z,0,0,id,server);
    }
}
module.exports = StaticEntity;