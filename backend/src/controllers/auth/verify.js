const TokenController = require("./token");
const Exception = require("../exception");
const SessionModel = require("../../models/session");
const UserModel = require("../../models/user");
const UserController = require("../../controllers/user");

exports.authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if(typeof authHeader !== 'undefined') {
        const token = authHeader.split(" ")[1];
        if (token !== null) {
            try {
                const tokenData = TokenController.verifyAccessToken(token);
                if(!(await SessionModel.getRefreshToken(tokenData.wizard, tokenData.session)))
                    return next(new Exception(106));
                req.auth = tokenData;
                return next();
            } catch(err) {
                next(new Exception(106));
            }
        }
    }
    next(new Exception(106));
}

exports.verifyControlToken = async (controlToken) => {
    const tokenData = TokenController.verifyControlToken(controlToken);
    if(!tokenData)
        return false;
    const verifyFlag = await UserModel.verifyUserTokenById(tokenData.wizard, tokenData.token);
    const updateFlag = await UserController.updateUserToken(tokenData.wizard);
    return verifyFlag && updateFlag ? tokenData.wizard : false;
}
