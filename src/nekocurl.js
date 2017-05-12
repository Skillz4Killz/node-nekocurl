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
        if(!Nekocurl.defaultDriver) {
            throw new Error('Nekocurl: No drivers available');
        }
        
        this.options = { };
        if(url) {
            this.setURL(url);
        }
        
        this.options.driver = Nekocurl.defaultDriver;
        this.options.method = 'GET';
        this.options.headers = { };
        this.options.data = options.data || null;
        this.options.files = options.files || [ ];
        this.options.autoString = (options.autoString !== undefined ? !!options.autoString : true);
        this.options.encoding = (options.encoding !== undefined ? options.encoding : undefined);
        this.options.json = !!options.json;
        
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
        if(Nekocurl.availableDrivers.has(driver)) {
            this.options.driver = driver;
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
        this.options.method = method.toUpperCase();
        return this;
    }
    
    /**
     * Set the url.
     *
     * @param     {string}    url        Do I really need to explain this?
     * @returns   {this}
     * @throws    {Error}
     */
    setURL(url) {
        if(Nekocurl.isValidURL(url)) {
            this.options.url = url;
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
        this.options.headers[name.toLowerCase()] = val;
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
        this.options.data = data;
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
        this.options.files.push({ name: name, data: data, filename: filename });
        return this;
    }
    
    /**
       * Sends the request.
       *
       * @param     {boolean}   [resolveWithFullResponse=false]         Determines if you get the full response or just the body.
       * @returns   {Promise<string|object>}
       */
    async send(resolveWithFullResponse) {
        if(!this.options.url) {
            throw new Error('Nekocurl: No url specified');
        }
        
        if(this.options.headers['user-agent'] === undefined) {
            this.setHeader('User-Agent', 'Nekocurl v'+Nekocurl.version+' ('+this.getDrivername()+')');
        }
        
        if(this.options.json === true && this.options.headers['content-type'] !== 'application/json') {
            this.setHeader('Content-Type', 'application/json');
        }
        
        const request = this.getDriver()(this.options);
        const response = await request;
        
        if(this.options.autoString === true && response.body instanceof Buffer) {
            response.body = response.body.toString();
        }
        
        if(this.options.json === true && !(response.body instanceof Object) && typeof response.body === 'string') {
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
        if(!this.options.url) {
            throw new Error('Nekocurl: No url specified');
        }
        
        if(this.options.headers['user-agent'] === undefined) {
            this.setHeader('User-Agent', 'Nekocurl v'+Nekocurl.version+'-'+this.getDrivername()+' (https://github.com/CharlotteDunois/node-nekocurl)');
        }
        
        if(this.options.json === true && this.headers['content-type'] !== 'application/json') {
            this.setHeader('Content-Type', 'application/json');
        }
        
        return this.getDriver()(this.options);
    }
    
    /**
     * Returns the driver.
     *
     * @returns   {Function}
     */
    getDriver() {
        return Nekocurl.availableDrivers.get(this.options.driver);
    }
    
    /**
     * Returns the drivername.
     *
     * @returns   {string}
     */
    getDrivername() {
        return this.options.driver;
    }
}

const { NEKOCURL_DEFAULT_DRIVER } = process.env;
const fs = require('fs');

/**
 * All drivers available for use.
 * @type {Map}
 */
Nekocurl.availableDrivers = new Map();

/**
 * Nekocurl's default driver, if not overwritten instance-specific. Use environment variable 'NEKOCURL_DEFAULT_DRIVER' to overwrite the library's default driver (if available).
 */
Nekocurl.defaultDriver = '';

/**
 * Nekocurl version.
 */
Nekocurl.version = require(__dirname+'/../package.json').version;


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

if(NEKOCURL_DEFAULT_DRIVER && Nekocurl.availableDrivers.has(NEKOCURL_DEFAULT_DRIVER) === true) {
    Nekocurl.defaultDriver = NEKOCURL_DEFAULT_DRIVER;
} else if(Nekocurl.availableDrivers.has('snekfetch')) {
    Nekocurl.defaultDriver = 'snekfetch';
} else if(Nekocurl.availableDrivers.size > 0) {
    Nekocurl.defaultDriver = Nekocurl.availableDrivers.keys().next().value;
}

module.exports = Nekocurl;
