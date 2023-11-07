const jwt = require("jsonwebtoken");
require('dotenv').config();
const {accessTokenDurability, refreshTokenDurability, controlTokenDurability} = require("../../config");

exports.generateAccessToken = function(data) {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {expiresIn: accessTokenDurability})
}

exports.generateRefreshToken = function(data) {
        return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {expiresIn: refreshTokenDurability});

}

exports.generateControlToken = function(data) {
    return jwt.sign(data, process.env.CONTROL_TOKEN_SECRET, {expiresIn: controlTokenDurability});

}

exports.verifyAccessToken = function(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

exports.verifyRefreshToken = function(token) {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch(err) {
        return false;
    }
}

exports.verifyControlToken = function (token) {
    try {
        return jwt.verify(token, process.env.CONTROL_TOKEN_SECRET);
    } catch(err) {
        return false;
    }
}
