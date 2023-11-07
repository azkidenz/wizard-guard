const WizardModel = require('./wizard');

exports.pushSession = async (wizard, session, location, userAgent, refreshToken, expiration) => {
    const sessionData = {
        id: session,
        location: location,
        userAgent: userAgent,
        refreshToken: {
            value: refreshToken,
            expiration: expiration
        }
    };
    await WizardModel.updateOne({ "_id": wizard }, { $push: { "sessions": sessionData } });
};

exports.popSession = async (wizard, id) => {
    return await WizardModel.updateOne({"_id": wizard}, { $pull: { "sessions": { "id": id } }}) ?? false;
}

exports.clearSessions = async (wizard, id = undefined) => {
    if(id === undefined)
        return await WizardModel.updateOne({"_id":wizard}, { $set: { "sessions": [] }}) ?? false;
    return await WizardModel.updateMany({"_id":wizard},  { $pull: {  "sessions": { "id": { $ne: id } }} }) ?? false;
}

exports.getRefreshToken = async (wizard, session) => {
    return await WizardModel.findOne({"_id": wizard, "sessions.id": session}).select({'sessions.$': 1}).exec() ?? false;
}

exports.getAllSessions = async (wizard) => {
    return await WizardModel.findOne({"_id": wizard}).select({"_id": 0, "sessions.id": 1, "sessions.location": 1, "sessions.userAgent": 1}).exec() ?? false;
}

exports.isNewCountry = async (wizard, location) => {
    const result = await WizardModel.aggregate([
        {$match: {"_id": wizard, "sessions.1": {
                "$exists": true
            }}},
        {$unwind: '$sessions'},
        {
            $group: {
                _id: "$sessions.location",
                total: {"$sum": 1}
            }
        },
        {$match: {total: 1, _id: location}},
    ]).exec();
    return !(!Array.isArray(result) || !result.length);
}
