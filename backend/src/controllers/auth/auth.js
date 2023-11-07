const TokenController = require("./token");

const getAccessRefreshTokensData = (id, email, session) => {
    return {
        wizard: id,
        user: email,
        session: session
    }
}

const getControlTokenData = (id, token) => {
    return {
        wizard: id,
        token: token
    }
}

exports.generateTokens = (id, email, session) => {
    const tokenData = getAccessRefreshTokensData(id, email, session);
    const accessToken = TokenController.generateAccessToken(tokenData);
    const refreshToken = TokenController.generateRefreshToken(tokenData);
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
}

exports.generateControlToken = (id, token) => {
    const tokenData = getControlTokenData(id, token);
    return TokenController.generateControlToken(tokenData);
}


