/**
 * @class
 * @name Box
 * 
 */
class Box{//object representation of a box
    /**
     * @member {number} id
     * @member {number} x
     * @member {number} y
     * @member {boolean} wall
     */
    /**
     * @constructor
     * @param {number} id 
     * @param {number} x 
     * @param {number} y
     * @param {boolean} wall
     */
    constructor(id,x,y,wall){
        Object.assign(this,{_id:id,x,y,wall});
    }
    /**
     * @param {number} id
     */
    set id(id){
        this._id = id;
    }
    get id(){
        return this._id;
    }
    /**
     * @param {number} num
     * @param {Buffer} b
     */
    data(num,b){
        let ie = this._id;
        b.writeUInt8(ie,num);
        b.writeUInt8(+this.wall,num+1)
    }
}

module.exports = Box;