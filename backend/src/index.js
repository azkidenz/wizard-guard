require('dotenv').config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const mongoConfig = "mongodb+srv://" + process.env.MONGO_USER + ":" + process.env.MONGO_PSWD + "@" + process.env.MONGO_HOST + "/?retryWrites=true&w=majority";

mongoose.connect(mongoConfig);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

const { port } = require("./config");
const PORT = process.env.PORT || port;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*app.use(
    session({
        //store:new RedisStore({client:redisClient}),
        secret: "my_session_secret",
        resave: true,
        saveUninitialized: false,
        cookie:{
            // Only set to true if you are using HTTPS.
            // Secure Set-Cookie attribute.
            secure:true,
            // Only set to true if you are using HTTPS.
            httpOnly:false,
            // Session max age in milliseconds. (1 min)
            // Calculates the Expires Set-Cookie attribute
            maxAge:60000
        }
    })
);*/
//const routes = require('./routes/routes');

//app.use('/api/v1', routes);

app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`)
})

app.get("/",(req,res) => {
        return res.status(200).json({
            status: true,
            data: "Ciao",
        });
});