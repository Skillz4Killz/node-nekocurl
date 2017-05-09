/**
 * Nekocurl
 * @description A HTTP client class that uses plug-in drivers to do HTTP requests.
 * @author      Charlotte Dunois (https://github.com/CharlotteDunois/node-nekocurl)
*/

class Nekocurl {
    /**
     * Creates a new instance of Nekocurl.
     *
     * @constructor
     * @param     {string}                url                 The url, what else?
     * @param     {object}                [options={ }]       Any options you want to pass.
     * @param     {string}                options.method      The request method. Any of GET, POST, HEAD, PATCH, PUT and DELETE.
     * @param     {object}                options.headers     HTTP-Headers.
     * @param     {string|null}           options.data        The request payload.
     * @param     {array}                 options.files       An array containing file objects (See <Nekocurl>.attachFile)
     * @param     {boolean}               options.autostring  Automatically turn buffers into strings. (default true)
     * @param     {string|undefined}      options.encoding    Encoding (only used by some drivers, e.g. request).
     * @param     {boolean}               options.json        Set true, if payload is JSON and/or Nekocurl should automatically parse response JSON (Snekfetch does it depending on Content-Type).
     * @param     {string|undefined}      options.drivers     The driver which should be used.
     * @returns   {Nekocurl}
     */
    constructor(url, options = { }) {
        this.url = url;
        this.method = (options.method || 'GET').toUpperCase();
        this.headers = { };
        this.data = options.data || null;
        this.files = options.files || [ ];
        this.autostring = (options.autostring !== undefined ? options.autostring === true : true);
        this.encoding = (options.encoding !== undefined ? options.encoding : undefined);
        this.json = (options.json === true) || false;
        this.driver = options.driver || Nekocurl.defaultDriver;
        
        if(options.headers) {
            this.setHeaders(options.headers);
        }
    }
    
    /**
     * Set the driver.
     *
     * @param     {string}    driver      The driver which should be used.
     * @returns   {this}
     */
    setDriver(driver) {
        this.driver = driver;
        return this;
    }
    
    /**
     * Set the method.
     *
     * @param     {string}    method     The request method. Any of GET, POST, HEAD, PATCH, PUT and DELETE.
     * @returns   {this}
     */
    setMethod(method) {
        if([ 'GET', 'POST', 'HEAD', 'PATCH', 'PUT', 'DELETE' ].includes(method.toUpperCase()) === true) {
            this.method = method.toUpperCase();
        }
        
        return this;
    }
    
    /**
     * Set the url.
     *
     * @param     {string}    url        The url, what else? (if you want to change it)
     * @returns   {this}
     */
    setURL(url) {
        this.url = url;
        return this;
    }
    
    /**
     * Set a HTTP header.
     *
     * @param     {string}    name       The name (or key) of the header.
     * @param     {string}    val        The value of the header.
     * @returns   {this}
     */
    setHeader(name, val) {
        this.headers[name.toLowerCase()] = val;
        return this;
    }
    
    /**
     * Set multiple HTTP headers.
     *
     * @param     {object}    obj        Object containing HTTP-Headers.
     * @param     {string}    obj.name   The name (or key) of the header.
     * @param     {string}    obj.val    The value of the header.
     * @returns   {this}
     */
    setHeaders(obj) {
        for(const key of Object.keys(obj)) {
            this.setHeader(key, obj[key]);
        }
        
        return this;
    }
    
    /**
     * Set multiple HTTP headers.
     *
     * @param     {object}    obj        Object containing HTTP-Headers.
     * @param     {string}    obj.name   The name (or key) of the header.
     * @param     {string}    obj.val    The value of the header.
     * @returns   {this}
     */
    setData(data) {
        this.data = data;
        return this;
    }
    
    /**
     * Attach a file to the request.
     *
     * @param     {string}    name       The name of the field.
     * @param     {string}    data       The file data.
     * @param     {string}    filename   The filename.
     * @returns   {this}
     */
    attachFile(name, data, filename) {
        this.files.push({ name: name, data: data, filename: filename });
        return this;
    }
    
    /**
       * Sends the request.
       *
       * @param     {boolean}   [resolveWithFullResponse=false]         Determines if you get the full response or just the body.
       * @returns   {Promise<string|Object>}
       */
    async send(resolveWithFullResponse) {
        if(this.headers['user-agent'] === undefined) {
            this.setHeader('User-Agent', 'Nekocurl v'+packagejson.version+' ('+this.getDrivername()+')');
        }
        
        if(this.json === true && this.headers['content-type'] !== 'application/json') {
            this.setHeader('Content-Type', 'application/json');
        }
        
        const request = this.getDriver()(Object.assign({}, this));
        const response = await request;
        
        if(this.autostring === true && response.body instanceof Buffer) {
            response.body = response.body.tostring();
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
    
    /**
     * Sends the request and passes the request directly back.
     *
     * @returns   {Promise<string|Object>}
     */
    sendPassthrough() {
        if(this.headers['user-agent'] === undefined) {
            this.setHeader('User-Agent', 'Nekocurl v'+Nekocurl.version+'-'+this.getDrivername()+' (https://github.com/CharlotteDunois/node-nekocurl)');
        }
        
        if(this.json === true && this.headers['content-type'] !== 'application/json') {
            this.setHeader('Content-Type', 'application/json');
        }
        
        return this.getDriver()(Object.assign({}, this));
    }
    
    /**
     * Returns the driver.
     *
     * @returns   {Function}
     */
    getDriver() {
        if(this.driver && Nekocurl.availableDrivers.has(this.driver) === true) {
            return Nekocurl.availableDrivers.get(this.driver);
        }
        
        return Nekocurl.availableDrivers.get(Nekocurl.defaultDriver);
    }
    
    /**
     * Returns the drivername.
     *
     * @returns   {string}
     */
    getDrivername() {
        if(this.driver && Nekocurl.availableDrivers.has(this.driver) === true) {
            return this.driver;
        }
        
        return Nekocurl.defaultDriver;
    }
}

const fs = require('fs');
const packagejson = require(__dirname+'/../package.json');
if(packagejson.version.substr(-2) === '.0') {
    packagejson.version = packagejson.version.substr(0, (packagejson.version.length - 2));
}

/**
 * All drivers available for use.
 * @type {Map}
 */
Nekocurl.availableDrivers = new Map();

/**
 * Nekocurl's default driver, if not overwritten instance-specific.
 */
Nekocurl.defaultDriver = '';

/**
 * Nekocurl version.
 */
Nekocurl.version = packagejson.version;

const drivers = fs.readdirSync(__dirname+'/drivers/');
for(let drivername of drivers) {
    if(drivername.endsWith('.driver.js')) {
        try {
            Nekocurl.availableDrivers.set(drivername.substr(0, (drivername.length - 10)), require(__dirname+'/drivers/'+drivername));
        } catch(error) {
            
        }
    }
}

if(Nekocurl.availableDrivers.has('snekfetch') === true) {
    Nekocurl.defaultDriver = 'snekfetch';
} else if(Nekocurl.availableDrivers.size > 0) {
    Nekocurl.defaultDriver = Nekocurl.availableDrivers.keys().next().value;
} else {
    throw new Error('No Nekocurl drivers available.');
}

module.exports = Nekocurl;
