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
     */
    /**
     * @constructor
     * @param {number} id 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(id,x,y){
        Object.assign(this,{_id:id,x,y});
    }
    /**
     * @param {number} id
     */
    set id(id){
        this._id = id;
    }
}

module.exports = Box;