/**
 * Nekocurl
 * @description A HTTP client class that uses plug-in drivers to do HTTP requests.
 * @author      Charlotte Dunois (https://github.com/CharlotteDunois/node-nekocurl)
 *
 * @param     {string}                url                       The url, what else?
 * @param     {object}                [options={ }]             Any options you want to pass.
 * @param     {string}                options.driver            The driver which should be used.
 * @param     {string}                [options.method='GET']    The request method.
 * @param     {object}                [options.headers={ }]     HTTP-Headers.
 * @param     {string|null}           [options.data=null]       The request payload.
 * @param     {array}                 [options.files=[ ]]       An array containing objects ({ name, data, filename }), each representing a file.
 * @param     {boolean}               [options.autoString=true] Automatically turn buffers into strings.
 * @param     {string|null}           options.encoding          Encoding (only used by some drivers, e.g. request).
 * @param     {boolean}               [options.json=false]      Set true, if payload is JSON and/or Nekocurl should automatically parse response JSON (Snekfetch does it depending on Content-Type).
 * @returns   {Nekocurl}
 * @throws    {Error}
*/

class Nekocurl {
    constructor(url, options = { }) {
        if(url) {
            this.setURL(url);
        }
        
        this.method = 'GET';
        this.headers = { };
        this.data = options.data || null;
        this.files = options.files || [ ];
        this.autoString = (options.autoString !== undefined ? options.autoString === true : true);
        this.encoding = (options.encoding !== undefined ? options.encoding : undefined);
        this.json = (options.json === true) || false;
        
        if(options.driver) {
            this.setDriver(options.driver);
        }
        if(options.method) {
            this.setMethod(options.method);
        }
        if(options.headers) {
            this.setHeaders(options.headers);
        }
    }
    
    /**
     * Set the driver.
     *
     * @param     {string}    driver      The driver which should be used.
     * @returns   {this}
     * @throws    {Error}
     */
    setDriver(driver) {
        if(Nekocurl.availableDrivers.has(driver) === true) {
            this.driver = driver;
            return this;
        }
        
        throw new Error('Nekocurl: Cannot find specified driver "'+driver+'"');
    }
    
    /**
     * Set the method.
     *
     * @param     {string}    method     The HTTP request method.
     * @returns   {this}
     */
    setMethod(method) {
        this.method = method.toUpperCase();
        return this;
    }
    
    /**
     * Set the url.
     *
     * @param     {string}    url        The url, what else? (if you want to change it)
     * @returns   {this}
     * @throws    {Error}
     */
    setURL(url) {
        if(Nekocurl.isValidURL(url) === true) {
            this.url = url;
            return this;
        }
        
        throw new Error('Nekocurl: Invalid URL passed');
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
     * Set the request payload.
     *
     * @param     {string}    data        The request paylaod.
     * @returns   {this}
     */
    setData(data) {
        this.data = data;
        return this;
    }
    
    /**
     * Attach a file to the request.
     *
     * @param     {string}           name       The name of the field.
     * @param     {string|Buffer}    data       The file data.
     * @param     {string}           filename   The filename.
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
       * @returns   {Promise<string|object>}
       */
    async send(resolveWithFullResponse) {
        if(!url) {
            throw new Error('Nekocurl: No url specified');
        }
        
        if(this.headers['user-agent'] === undefined) {
            this.setHeader('User-Agent', 'Nekocurl v'+packagejson.version+' ('+this.getDrivername()+')');
        }
        
        if(this.json === true && this.headers['content-type'] !== 'application/json') {
            this.setHeader('Content-Type', 'application/json');
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
    
    /**
     * Sends the request and passes the request directly back.
     *
     * @returns   {Promise<object>}
     * @throws    {Error}
     */
    sendPassthrough() {
        if(!url) {
            throw new Error('Nekocurl: No url specified');
        }
        
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


/**
 * Checks if the passed url is valid.
 * @param  {string}  url
 * @returns {boolean}
 */
Nekocurl.isValidURL = (url) => {
    return /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i.test(url);
};

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
