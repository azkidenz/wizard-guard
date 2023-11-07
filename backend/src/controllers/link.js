const {baseUri} = require("../config");

const getControlTokenUriPart = (controlToken) => {
    return "&t=" + controlToken;
}

exports.getUserSignupVerifyLink = (controlToken) => {
    return baseUri + "?a=verify" + getControlTokenUriPart(controlToken);
}

exports.getUserPasswordChangeVerifyLink = (controlToken) => {
    return baseUri + "?a=reset" + getControlTokenUriPart(controlToken);
}

exports.getUserDeleteVerifyLink = (controlToken) => {
    return baseUri + "?a=delete" + getControlTokenUriPart(controlToken);
}