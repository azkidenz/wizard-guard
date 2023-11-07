const errorsFile = require("../data/errors.json");
const defaultSuccessHttpCode = 200;
const defaultFailHttpCode = 400;
const defaultErrorHttpCode = 500;

class ResponseController {
    #response;
    httpCode;

    constructor(lang) {
        this.lang = lang !== undefined ? lang : 'en';
        this.#response = {status: "error"};
    }

    setSuccess(data) {
        this.#response.status = "success";
        this.httpCode = defaultSuccessHttpCode;
        this.#setResponseData(data);
    }

    setFail(data) {
        this.#response.status = "fail";
        this.httpCode = defaultFailHttpCode;
        this.#setResponseData(data);
    }

    setError(code) {
        this.httpCode = defaultErrorHttpCode;
        this.#setErrorDetails(code);
    }

    #setErrorDetails(code) {
        const errors = Object.values(errorsFile)
        const result = errors.find(t=>t.code === code)
        if(result !== undefined) {
            this.#response.message = result.message[this.lang];
            this.httpCode = result.httpCode;
        }
    }

    getResponse() {
        return this.#response;
    }

    getHttpCode() {
        return this.httpCode;
    }

    #setResponseData(data) {
        this.#response.data = data !== undefined ? data : null;
    }

    static sanitizeData(data, keys) {
        for (let i = 0; i < keys.length; i++)
            delete data[keys[i]];
        return data;
    }

    static concatTwo(first, second) {
        return Object.assign({}, first, second);
    }
}
module.exports = ResponseController;