import express from "express";
import session from "./middlewares/session.js";
import passport from "passport";

import morgan from "morgan";
import createHttpError from "http-errors";
const { isHttpError } = createHttpError;
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/v1/auth.js";
import roleRoutes from "./routes/v1/role.js";
import permissionRoutes from "./routes/v1/permission.js";
import ppicRoutes from "./routes/v1/ppic.js";
import ppicSupplierRoutes from "./routes/v1/ppicSupplier.js";
import supplierRoutes from "./routes/v1/supplier.js";
import purchasingRoutes from "./routes/v1/purchasing.js";

import transactionRoutes from "./routes/v1/transaction.js";

import exportsRoutes from "./routes/v1/export.js";
import exportScheduleRoutes from "./routes/v1/exportSchedule.js";

import userRoutes from "./routes/v1/user.js";
import bodyParser from "body-parser";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import "./config/sequelize.js";

import { errorResponse } from "./helpers/index.js";
import { userIsAuthenticated, verifyTokenAndRole } from "./middlewares/auth.js";
import {
  dailyJobScheduleCheckTodayDeliveryDateAndOutstanding,
  dailyJobSupplierRefreshSupplier,
  dailyJobSupplierValidityCheck,
  dailyJobSupplierRefreshSupplierUser,
  hourlyJobUpdatePOOutstanding,
  hourlyJobUpdateColumnHistoryPOOuts,
  hourlyJobUpdateColumnChangesPOOuts,
  dailyJobClearTokenDB,
} from "./middlewares/cronjobs.js";
import { dynamicRateLimit } from "./middlewares/requestHandling.js";

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(
  cors({
    origin: [
      process.env.BASE_URL_CLIENT,
      "https://ppic-prototype.netlify.app/",
      "https://master--ppic-prototype.netlify.app/",
      "http://localhost:3000",
      "http://192.168.110.83:3000",
      "http://192.168.110.83:8000",
      "http://192.168.110.83:8001",
      "http://192.168.114.83:3000",
      "http://192.168.114.83:8000",
      "https://192.168.110.83:8443",
      "https://192.168.110.83:3000",
      "http://pcpodev.bkpprima.co.id:8000",
      "https://pcpodev.bkpprima.co.id:8000",
      "https://pcpodev.bkpprima.co.id:8443",
    ],
    methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.options("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); //|| req.get("Origin")
  res.header({
    "Access-Control-Allow-Headers": true,
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "Accept, Origin, Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Credentials": true,
  });
  //other headers here
  res.status(200).end();
});

app.use(session);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json({ limit: "50mb" }));
const currVer = "/v1";

app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
// const globalLimiter = rateLimit({
//   windowMs: 10 * 1000, // 10sec
//   limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
//   standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
//   // store: ... , // Redis, Memcached, etc. See below.
// });

// // Apply the rate limiting middleware to all requests.
// app.use(globalLimiter);
app.get(`${currVer}`, async (req, res) => {
  try {
    const packageJson = fs.readFileSync("package.json");
    const packageParse = JSON.parse(packageJson);
    const expressVersion = "v" + packageParse.dependencies.express.slice(1);
    const nodeJSVersion = process.version;

    res.render("index", { nodeJSVersion, expressVersion });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
//nsq
app.get(`${currVer}/config`, (req, res) => {
  res.json({
    WEB_URL: process.env.BASE_URL || "http://192.168.110.83",
    API_URL: process.env.BASE_URL || "http://192.168.110.83",
    WEB_PORT: process.env.WEB_PORT || 8002,
    API_PORT: process.env.API_PORT || 9092,
    API_TIMEOUT: process.env.API_TIMEOUT || 30000,
  });
});

app.use(`${currVer}`, authRoutes);
app.use(`${currVer}/roles`, userIsAuthenticated(), roleRoutes);
app.use(`${currVer}`, userIsAuthenticated(), permissionRoutes);
app.use(`${currVer}/users`, userIsAuthenticated(), userRoutes);
app.use(`${currVer}/transactions`, userIsAuthenticated(), transactionRoutes);
app.use(`${currVer}/ppic/suppliers`, ppicSupplierRoutes);
app.use(`${currVer}/ppic`, verifyTokenAndRole("ppic@view"), ppicRoutes);
app.use(
  `${currVer}/suppliers`,
  verifyTokenAndRole("supplier@view"),
  supplierRoutes
);
app.use(
  `${currVer}/purchasing`,
  verifyTokenAndRole("purchasing@view"),
  purchasingRoutes
);
app.use(`${currVer}/export/xlsx`, exportsRoutes);
app.use(`/`, exportScheduleRoutes);

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

dailyJobSupplierValidityCheck();
dailyJobSupplierRefreshSupplier();
dailyJobSupplierRefreshSupplierUser();
dailyJobScheduleCheckTodayDeliveryDateAndOutstanding();
hourlyJobUpdatePOOutstanding();
dailyJobClearTokenDB();
// hourlyJobUpdateColumnHistoryPOOuts();
// hourlyJobUpdateColumnChangesPOOuts();
export default app;
