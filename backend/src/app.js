require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const UserRoutes = require('./routes/user');
const MagicRoutes = require('./routes/magic');
const AuthRoutes = require('./routes/auth');
const SessionsRoutes = require('./routes/sessions');
const VaultRoutes = require('./routes/vault');
const {getErrorFromCode} = require('./controllers/mongo');
const {apiVersion, port, acceptedLanguages, allowedCorsDomains} = require("./config");
const ResponseController = require("./controllers/response");
const useragent = require('express-useragent');
const helmet = require('helmet');
const cors = require('cors');

mongoose.connect(process.env.MONGO_URI);
const database = mongoose.connection;

database.once('connected', () => {
    console.log('Database connected');
});

database.on('error', (error) => {
    console.log('Urca' + error);
});

const appPort = process.env.PORT || port;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
    origin: allowedCorsDomains
}));
app.disable('x-powered-by');
app.use(useragent.express());
app.set('trust proxy', true)

app.get(`/${apiVersion}`,async (req, res, next) => {
    console.log(req.useragent);
    console.log(req.ip);
    return res.status(418).json({
        merlin: "Oh, bah! Everybody’s got problems. The world’s full of problems.",
    });
});

app.use(express.json({
    verify: (req, res, buffer) => {
        try {
            JSON.parse(buffer);
        } catch(error) {
            const lang = req.acceptsLanguages(acceptedLanguages);
            const response = new ResponseController(lang);
            response.setError(105);
            return res.status(response.getHttpCode()).json(response.getResponse());
        }
    }
}));

app.use(`/${apiVersion}/user`, UserRoutes);
app.use(`/${apiVersion}/magicKey`, MagicRoutes);
app.use(`/${apiVersion}/auth`, AuthRoutes);
app.use(`/${apiVersion}/sessions`, SessionsRoutes);
app.use(`/${apiVersion}/vault`, VaultRoutes);

app.use((err, req, res, next) => {
    const lang = req.acceptsLanguages(acceptedLanguages);
    const response = new ResponseController(lang);
    switch(err.constructor.name) {
        case "Fail":
            response.setFail(err.getData());
            break;
        case "MongoServerError":
            response.setError(getErrorFromCode(err.code));
            break;
        case "Exception":
            response.setError(err.code);
            break;
        case "SyntaxError":
            return;
        default:
            response.setError(100);
    }
    console.log(err);
    return res.status(response.getHttpCode()).json(response.getResponse());
});

app.listen(appPort, () => {
    console.log(`Server started at ${appPort}`)
});