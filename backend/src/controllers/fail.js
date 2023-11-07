class Fail {
    #data;
    constructor(fail, isValidationFail = true) {
        if (isValidationFail)
            this.#setValidationFailData(fail);
        else this.#data = [fail];
    }

    #setValidationFailData(fail) {
        this.#data = [];
        for (let i = 0; i < fail.length; i++)
            this.#data.push({[fail[i].path]: fail[i].msg});
    }
}
module.exports = Fail;