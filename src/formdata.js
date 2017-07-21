/**
 * Nekocurl formdata
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const path = require('path');
const filetype = require('file-type');
const mimetypes = require('mime-types');

class FormData {
    constructor() {
        this.boundary = '--Nekocurl--'+Math.floor(Math.random() * 10000000);
        this.buffer = new Buffer(0);
    }

    append(name, data, filename) {
        let str = '\r\n--'+this.boundary+'\r\nContent-Disposition: form-data; name="'+name+'"';
        
        let mimetype = null;
        if(filename) {
            str += '; filename="'+filename+'"';
            mimetype = 'application/octet-stream';
            
            const extname = path.extname(filename).slice(1);
            if(extname) {
                mimetype = mimetypes.contentType(extname);
            }
        }

        if(data instanceof Buffer) {
            mimetype = filetype(data).mime;
        } else {
            data = Buffer.from(String(data));
        }

        if(mimetype) {
            str += '\r\nContent-Type: '+mimetype;
        }
        
        this.buffer = Buffer.concat([
            this.buffer,
            Buffer.from(str+'\r\n\r\n'),
            data
        ]);
    }

    finalize() {
        this.buffer = Buffer.concat([
            this.buffer,
            Buffer.from('\r\n--'+this.boundary+'--')
        ]);
        
        return this.buffer;
    }
}

module.exports = FormData;
