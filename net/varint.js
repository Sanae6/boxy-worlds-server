const bbp = require("binary-buffer-parser");
/**
 * @deprecated useless due to lack of requirement for the irritatingly difficult to deal with varints 
 * @param {bbp} buffer 
 */
function readUIntV(buffer) {
	buffer.littleEndian();
	let p = buffer.tell();
	let a = buffer.uint32();
	buffer.seek(p);
	if (a&1){
		return a >> 1;
	}else if (a&2){
		a = buffer.uint16();
		return a;
	}else if (a&4){
		a |= buffer.uint16()>>8;
		return (a>>3)+0x4080;
	}
}