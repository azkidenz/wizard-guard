const SessionModel = require("../models/session");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {getISOLocationCodeByIp} = require("../services/ip2location");

exports.pushSession = async (wizard, session, ip, rawUserAgent, refreshToken) => {
    const ua = defineUserAgent(rawUserAgent)
    const location = getISOLocationCodeByIp(ip);
    const expiration = jwt.decode(refreshToken, { complete: true }).payload.exp;
    const ms = new Date().getTime() + expiration;
    await SessionModel.pushSession(wizard, session, location, ua, refreshToken, new Date(ms));
}

exports.generateSessionId = () => {
    return new mongoose.mongo.ObjectId();
}

exports.verifyRefreshToken = async (wizard, session, refreshToken) => {
    console.log(wizard, session, refreshToken);
    const dbRefreshToken = await SessionModel.getRefreshToken(wizard, session);
    if(!dbRefreshToken || Date.parse(dbRefreshToken.sessions[0].refreshToken.expiration) < Date.now())
        return false;
    return dbRefreshToken.sessions[0].refreshToken.value === refreshToken;
}

const defineUserAgent = (ua) => {
    const userAgent = {
        device: ua.os,
        client: ua.browser,
        type: "unknown"
    };
    if(ua.isDesktop || ua.isMobile)
        userAgent.type = "web";
    if(ua.browser === "unknown" && ua.source !== "unknown") {
        if (ua.source.startsWith("Cordova")) {
            const data = ua.source.split(" ");
            userAgent.device = data[1];
            userAgent.client = "App " + data[2];
            userAgent.type = "mobile";
        } else userAgent.client = ua.source;
    }
    else if(ua.version !== "unknown")
        userAgent.client += " " + ua.version;
    return userAgent;
}

exports.getAllSessions = async (wizard, session) => {
    const data = await SessionModel.getAllSessions(wizard);
    if(!data)
        return false;
    return { ...data._doc, ...{current: session.toString()}};
}

exports.clearSessions = async (wizard, session, deleteCurrentSession = false) => {
    if(deleteCurrentSession)
        return await SessionModel.clearSessions(wizard, session);
    return await SessionModel.clearSessions(wizard);
}

