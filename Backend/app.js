const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const schedule = require("node-schedule");
const sgMail = require("@sendgrid/mail");
const NaturalLanguageUnderstandingV1 = require("ibm-watson/natural-language-understanding/v1");
const { IamAuthenticator } = require("ibm-watson/auth");
const { request } = require("express");

require("dotenv").config();

const User = require("./api/models/user");
const companies = require("./util/companies.json");
const EmailTemplates = require("./util/emails");

const app = express();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//Require Atlas database URI from environment variables
const DBURI = process.env.DBURI;

//Connect to MongoDB client using mongoose
mongoose
  .connect(DBURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));

mongoose.Promise = global.Promise;

//Use helmet to prevent common security vulnerabilities
app.use(helmet());

//Set static folder
app.use("/uploads", express.static("./public"));

//Use body-parser to parse json body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());

//Define routes
app.use("/news", require("./api/routes/news.routes"));
app.use("/report", require("./api/routes/report.routes"));
app.use("/user", require("./api/routes/user.routes"));
app.use("/company", require("./api/routes/companies.routes"));
app.use("/stock", require("./api/routes/stock.routes"));
app.use("/scraper", require("./api/routes/scraper.routes"));
// app.use("/crypto", require("./api/routes/crypto.routes"));

//This function will give a 404 response if an undefined API endpoint is fired
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

// Initialize IBM Watson NLU
const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: "2020-08-01",
  authenticator: new IamAuthenticator({
    apikey: process.env.NATURAL_LANGUAGE_UNDERSTANDING_APIKEY,
  }),
  serviceUrl: process.env.NATURAL_LANGUAGE_UNDERSTANDING_URL,
});

// Schedule a job that runs every hour for sending tracking mails
var j = schedule.scheduleJob("0 0 * * * *", async function (fireDate) {
  console.log("This job will run every hour");

  let entitiesArr = [];
  let companyArr = [];

  const analyzeParams = {
    url: "https://inshorts.com/en/read/business",
    features: {
      entities: {
        limit: 200,
        sentiment: true,
      },
    },
  };

  await naturalLanguageUnderstanding
    .analyze(analyzeParams)
    .then((analysisResults) => {
      const entities = analysisResults.result.entities;
      for (i in entities) {
        if (entities[i].type == "Company" && entities[i].sentiment.score != 0) {
          entitiesArr.push(entities[i]);
        }
      }

      for (i in companies) {
        for (j in entitiesArr) {
          if (
            companies[i]["Company Name"].includes(entitiesArr[j].text) ||
            companies[i]["Symbol"].includes(entitiesArr[j].text)
          ) {
            let obj = {};
            obj.companyName = companies[i]["Company Name"];
            obj.symbol = companies[i]["Symbol"];
            obj.sentiment = entitiesArr[j].sentiment;
            companyArr.push(obj);
          }
        }
      }
      // console.log(companyArr);
    })
    .catch((err) => {
      console.log(err.toString());
    });

  var status = "";
  await User.find()
    .then(async (users) => {
      for (i in users) {
        for (j in users[i].tracking) {
          for (k in companyArr) {
            if (
              !users[i].tracking[j].mailSent &&
              companyArr[k].companyName == users[i].tracking[j].companyName
            ) {
              if (companyArr[k].sentiment.label == "positive") {
                status = "rise";
              } else {
                status = "fall";
              }

              const msg = {
                to: users[i].email,
                from: {
                  email: process.env.SENDGRID_EMAIL,
                  name: "Stonks",
                },
                subject: `Stock update: ${companyArr[k].companyName}`,
                text: ` `,
                html: EmailTemplates.tracker(
                  users[i].name,
                  companyArr[k].companyName,
                  status
                ),
              };

              await sgMail
                .send(msg)
                .then(async () => {
                  users[i].tracking[j].mailSent = true;
                  await users[i].save();
                })
                .catch((err) => {
                  console.log(err.toString());
                });
            }
          }
        }
      }
    })
    .catch((err) => {
      console.log(err.toString());
    });
});

// Schedule a job that runs at 6:30 AM everyday
var k = schedule.scheduleJob("0 30 6 * * *", async function (fireDate) {
  console.log("test");
  await User.find()
    .then(async (users) => {
      for (i in users) {
        for (j in users[i].tracking) {
          users[i].tracking[j].mailSent = false;
          await users[i].save();
        }
      }
    })
    .catch((err) => {
      console.log(err.toString());
    });
});

const PORT = process.env.PORT || 8080;

//Start the server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
