/**
 * Nekoclient
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekoclient
*/

const fs = require('fs');
const packagejson = require(__dirname+'/../package.json');
if(packagejson.version.substr(-2) === '.0') {
    packagejson.version = packagejson.version.substr(0, (packagejson.version.length - 2));
}

class Nekoclient {
    constructor(url, options = { }) {
        this.url = url;
        this.method = (options.method || 'GET').toUpperCase();
        this.headers = { };
        this.data = options.data || null;
        this.files = options.files || [ ];
        this.autoString = (options.autoString !== undefined ? options.autoString === true : true);
        this.encoding = (options.encoding !== undefined ? options.encoding : undefined);
        this.json = (options.json === true) || false;
        this.driver = options.driver || Nekoclient.defaultDriver;
        
        if(options.headers) {
            this.setHeaders(options.headers);
        }
    }
    
    setDriver(driver) {
        this.driver = driver;
        return this;
    }
    
    setMethod(method) {
        if([ 'GET', 'POST', 'HEAD', 'PATCH', 'PUT', 'DELETE' ].includes(method.toUpperCase()) === true) {
            this.method = method.toUpperCase();
        }
        
        return this;
    }
    
    setURL(url) {
        this.url = url;
        return this;
    }
    
    setHeader(name, val) {
        this.headers[name.toLowerCase()] = val;
        return this;
    }
    
    setHeaders(obj) {
        for(const key of Object.keys(obj)) {
            this.setHeader(key, obj[key]);
        }
        
        return this;
    }
    
    setData(data) {
        this.data = data;
        return this;
    }
    
    attachFile(name, data, filename) {
        this.files.push({ name: name, data: data, filename: filename });
        return this;
    }
    
    async send(resolveWithFullResponse) {
        if(this.headers['user-agent'] === undefined) {
            this.setHeader('User-Agent', 'Nekoclient v'+packagejson.version+' ('+this.getDrivername()+')');
        }
        
        const request = this.getDriver()(Object.assign({}, this));
        const response = await request;
        
        if(this.autoString === true && response.body instanceof Buffer) {
            response.body = response.body.toString();
        }
        
        if(this.json === true && !(response.body instanceof Object) && typeof response.body === 'string') {
            try {
                response.body = JSON.parse(response.body);
            } catch(err) {
                  
            }
        }
        
        if(!!resolveWithFullResponse === true) {
            return response;
        }
        
        return response.body;
    }
    
    sendPassthrough() {
        if(this.headers['user-agent'] === undefined) {
            this.setHeader('User-Agent', 'Charuru v'+packagejson.version+'/Nekoclient-'+this.getDrivername());
        }
        
        return this.getDriver()(Object.assign({}, this));
    }
    
    getDriver() {
        if(this.driver && Nekoclient.availableDrivers.has(this.driver) === true) {
            return Nekoclient.availableDrivers.get(this.driver);
        }
        
        return Nekoclient.availableDrivers.get(Nekoclient.defaultDriver);
    }
    
    getDrivername() {
        if(this.driver && Nekoclient.availableDrivers.has(this.driver) === true) {
            return this.driver;
        }
        
        return Nekoclient.defaultDriver;
    }
}

Nekoclient.availableDrivers = new Map();
Nekoclient.defaultDriver = '';

const drivers = fs.readdirSync(__dirname+'/drivers/');
for(let drivername of drivers) {
    if(drivername.endsWith('.driver.js')) {
        try {
            Nekoclient.availableDrivers.set(drivername.substr(0, (drivername.length - 10)), require(__dirname+'/drivers/'+drivername));
        } catch(error) {
            console.error(error);
        }
    }
}

if(Nekoclient.availableDrivers.has('snekfetch') === true) {
    Nekoclient.defaultDriver = 'snekfetch';
} else if(Nekoclient.availableDrivers.size > 0) {
    Nekoclient.defaultDriver = Nekoclient.availableDrivers.keys().next().value;
} else {
    throw new Error('No Nekoclient drivers available.');
}

module.exports = Nekoclient;
