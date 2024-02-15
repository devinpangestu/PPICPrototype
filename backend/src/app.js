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

import userRoutes from "./routes/v1/user.js";
import bodyParser from "body-parser";

import fs from "fs";

import "./config/sequelize.js";

import { errorResponse } from "./helpers/index.js";
import { userIsAuthenticated, verifyTokenAndRole } from "./middlewares/auth.js";
import {
  dailyJobSupplierRefreshSupplier,
  dailyJobSupplierValidityCheck,
} from "./middlewares/cronjobs.js";

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());

app.use(
  bodyParser.urlencoded({
    extended: true,
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
app.use(bodyParser.json());
const currVer = "/v1";

app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(cookieParser());

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

app.use(`${currVer}`, authRoutes);
app.use(`${currVer}/roles`, userIsAuthenticated(), roleRoutes);
app.use(`${currVer}`, userIsAuthenticated(), permissionRoutes);
app.use(`${currVer}/users`, userIsAuthenticated(), userRoutes);
app.use(`${currVer}/transactions`, userIsAuthenticated(), transactionRoutes);
app.use(
  `${currVer}/ppic/suppliers`,

  ppicSupplierRoutes
);
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

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

dailyJobSupplierValidityCheck();
dailyJobSupplierRefreshSupplier();

export default app;
