require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const useragent = require("express-useragent");
const requestIp = require("request-ip");

const indexRouter = require("./src/routes/index");
const authRouter = require("./src/routes/auth");
const userRouter = require("./src/routes/user");
const userRegistrationRouter = require("./src/routes/user-registration");
const consumerService = require("./src/services/external/message_broker/consumer");

const app = express();

const whitelist = [
  "http://localhost:5003",
  "http://localhost:3001",
  "http://localhost:3000",
  "http://kms-dev.smartkmsystem.com",
  "https://kms-dev.smartkmsystem.com",
  "http://sso-dev.smartkmsystem.com",
  "https://sso-dev.smartkmsystem.com",
  "https://kms.smartkmsystem.com",
  "https://smartkmsystem.com" /** other domains if any */,
];
const corsOptions = {
  credentials: true,
  // origin: function (origin, callback) {
  //   if (whitelist.indexOf(origin) !== -1) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error("Not allowed by CORS"));
  //   }
  // },
  origin: true,
};

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Headers', 'X-INSTANA-X, X-INSTANA-T, X-INSTANA-S, X-INSTANA-L');
  next();
});

app.use(requestIp.mw());
app.use(useragent.express());
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/user-registration", userRegistrationRouter);

consumerService.init();

module.exports = app;
