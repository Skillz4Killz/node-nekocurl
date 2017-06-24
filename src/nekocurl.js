/**
 * Nekocurl
 * @description A HTTP client class that uses plug-in drivers to do HTTP requests.
 * @author      Charlotte Dunois (https://github.com/CharlotteDunois/node-nekocurl)
 *
 * @param     {string}                url                       The url, what else?
 * @param     {object}                [options={ }]             Any options you want to pass.
 * @param     {string}                options.driver            The driver which should be used.
 * @param     {string}                [options.method='GET']    The request method.
 * @param     {HeadersOptions}        [options.headers={ }]     HTTP-Headers.
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
        
        this._options = { };
        if(url) {
            this.setURL(url);
        }
        
        this._options.driver = Nekocurl.defaultDriver;
        this._options.method = 'GET';
        this._options.headers = { };
        this._options.data = null;
        this._options.files = [ ];
        this._options.autoString = (options.autoString !== undefined ? !!options.autoString : true);
        this._options.encoding = (options.encoding !== undefined ? options.encoding : undefined);
        this._options.json = !!options.json;
        
        if(options.driver) {
            this.setDriver(options.driver);
        }
        if(options.method) {
            this.setMethod(options.method);
        }
        if(options.headers) {
            this.setHeaders(options.headers);
        }
        if(options.data) {
            this.setData(options.data);
        }
        if(options.files) {
            this.attachFiles(options.files);
        }
    }
    
    /**
     * Checks if a given driver exists.
     *
     * @param     {string}    driver      The driver to test for existence
     * @returns   {bool}
     */
    hasDriver(driver) {
        return Nekocurl.availableDrivers.has(driver);
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
            this._options.driver = driver;
            return this;
        }
        
        throw new Error('Nekocurl: Cannot find specified driver "'+driver+'"');
    }
    
    /**
     * Set the method.
     *
     * @param     {string}    method     The HTTP request method.
     * @returns   {this}
     * @throws    {Error}
     */
    setMethod(method) {
        if(typeof method === 'string') {
            this._options.method = method.toUpperCase();
            return this;
        }
        
        throw new Error('Nekocurl: Invalid method passed');
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
            this._options.url = url;
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
     * @throws    {Error}
     */
    setHeader(name, val) {
        if(typeof name === 'string' && val !== undefined && String(val).length > 0) {
            this._options.headers[name.toLowerCase()] = String(val);
            return this;
        }
        
        throw new Error('Nekocurl: Invalid header passed');
    }
    
    /**
     * Set multiple HTTP headers.
     *
     * @param     {HeaderOptions}   obj  HTTP-Headers.
     * @returns   {this}
     * @throws    {Error}
     */
    setHeaders(obj) {
        if(obj instanceof Object) {
            for(const key of Object.keys(obj)) {
                this.setHeader(key, obj[key]);
            }
            
            return this;
        }
        
        throw new Error('Nekocurl: Invalid headers passed');
    }
    
    /**
     * Set the request payload.
     *
     * @param     {string}    data        The request paylaod.
     * @returns   {this}
     * @throws    {Error}
     */
    setData(data) {
        if(typeof data === 'string') {
            this._options.data = data;
            return this;
        }
        
        throw new Error('Nekocurl: Invalid data passed');
    }
        
    /**
     * Attach a file to the request.
     *
     * @param     {string}           name       The name of the field.
     * @param     {string|Buffer}    data       The file data.
     * @param     {string}           filename   The filename.
     * @returns   {this}
     * @throws    {Error}
     */
    attachFile(name, data, filename) {
        if(typeof name === 'string' && (data instanceof Buffer || typeof data === 'string') && typeof filename === 'string') {
            this._options.files.push({ name: name, data: data, filename: filename });
            return this;
        }
        
        throw new Error('Nekocurl: Invalid file passed');
    }
    
    /**
     * Attach multiple files to the request.
     *
     * @param     {Array<FileOptions>}  files         Arrays containing file objects.
     * @returns   {this}
     * @throws    {Error}
     */
    attachFiles(files) {
        if(files instanceof Array) {
            for(const file of files) {
                this.attachFile(file.name, file.data, file.filename);
            }
            
            return this;
        }
        
        throw new Error('Nekocurl: Invalid files passed');
    }
    
    /**
     * Sends the request.
     *
     * @param     {boolean}   [resolveWithFullResponse=false]         Determines if you get the full response or just the body (or if HEAD request the headers).
     * @returns   {Promise<string|object>}
     */
    async send(resolveWithFullResponse) {
        const options = this._options;
        if(!options.url) {
            throw new Error('Nekocurl: No url specified');
        }

        if(options.headers['user-agent'] === undefined) {
            this.setHeader('User-Agent', Nekocurl.defaultUseragent);
        }

        if(options.json === true && options.headers['content-type'] !== 'application/json') {
            this.setHeader('Content-Type', 'application/json');
        }

        const request = this.getDriver()(options);
        const response = await request;

        if(options.autoString === true && response.body instanceof Buffer) {
            response.body = response.body.toString();
        }

        if(options.json === true && !(response.body instanceof Object) && typeof response.body === 'string') {
            try {
                response.body = JSON.parse(response.body);
            } catch(err) {
                /* continue regardless of error */
            }
        }

        if(!!resolveWithFullResponse === true) {
            return response;
        }
        
        if(options.method === 'HEAD') {
            return response.headers;
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
        const options = this._options;
        if(!options.url) {
            throw new Error('Nekocurl: No url specified');
        }

        if(options.headers['user-agent'] === undefined) {
            this.setHeader('User-Agent', Nekocurl.defaultUseragent);
        }

        if(options.json === true && options.headers['content-type'] !== 'application/json') {
            this.setHeader('Content-Type', 'application/json');
        }

        return this.getDriver()(options);
    }
    
    /**
     * Returns the driver.
     *
     * @returns   {Function}
     */
    getDriver() {
        return Nekocurl.availableDrivers.get(this._options.driver);
    }
    
    /**
     * Returns the drivername.
     *
     * @returns   {string}
     */
    getDrivername() {
        return this._options.driver;
    }
}

/**
 * @typedef      {object}           FileOptions
 * @property     {string}           name          The name of the field.
 * @property     {string|Buffer}    data          The file data.
 * @property     {string}           filename      The filename.
 */
 
/**
 * @typedef      {object}           HeadersOptions
 * @description  Each key of an property is the name (or key) of the HTTP-Header, while the property value is the HTTP-Header value.
 */

const { NEKOCURL_DEFAULT_DRIVER, NEKOCURL_DEFAULT_USERAGENT } = process.env;
const fs = require('fs');
const path = require('path');

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
 * Use environment variable 'NEKOCURL_DEFAULT_USERAGENT' to overwrite the library's default useragent. Or overwrite this variable, if you think that's a good idea.
*/
Nekocurl.defaultUseragent = (NEKOCURL_DEFAULT_USERAGENT ? NEKOCURL_DEFAULT_USERAGENT : 'Nekocurl v'+Nekocurl.version+' '+options.driver+' (https://github.com/CharlotteDunois/node-nekocurl)');

/**
 * Nekocurl version.
 */
Nekocurl.version = require(path.join(__dirname, '..', 'package.json')).version;

/**
 * Checks if the passed url is valid.
 * @param  {string}  url
 * @returns {boolean}
 */
Nekocurl.isValidURL = (url) => {
    return /^(?:(?:https?):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
};

const drivers = fs.readdirSync(path.join(__dirname, 'drivers'));
for(let drivername of drivers) {
    if(drivername.endsWith('.driver.js')) {
        try {
            Nekocurl.availableDrivers.set(drivername.substr(0, (drivername.length - 10)), require(path.join(__dirname, 'drivers', drivername)));
        } catch(error) {
            /* continue regardless of error */
        }
    }
}

if(Nekocurl.availableDrivers.has(NEKOCURL_DEFAULT_DRIVER)) {
    Nekocurl.defaultDriver = NEKOCURL_DEFAULT_DRIVER;
} else if(Nekocurl.availableDrivers.has('snekfetch')) {
    Nekocurl.defaultDriver = 'snekfetch';
} else if(Nekocurl.availableDrivers.size > 0) {
    Nekocurl.defaultDriver = Nekocurl.availableDrivers.keys().next().value;
}

module.exports = Nekocurl;
