/**
 * @class
 * @name Box
 */
class Box{//object representation of a box
    /**
     * @constructor
     * @param {number} id 
     * @param {number} x 
     * @param {number} y
     * @param {boolean} wall
     */
    constructor(id,x,y,wall){
        /**
         * @name id
         * @type {number}
         */
        this.id = id;
        /**
         * @name x
         * @type {number}
         */
        this.x = x;
        /**
         * @name y
         * @type {number}
         */
        this.y = y;
        /**
         * @name wall
         * @type {boolean}
         */
        this.wall = wall;
    }
    /**
     * @param {number} num
     * @param {Buffer} b
     */
    data(num,b){
        b.writeUInt8(Math.abs(this.id),num);
        b.writeUInt8(+this.wall,num+1)
    }
    copy(){
        return new Box(this.id,this.x,this.y,this.wall)
    }
}

module.exports = Box;