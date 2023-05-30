# Stonks Backend

- FinTech

cd Stonks-Backend
npm install
```

These variables should reside as key value pairs in a file called `.env`.

|               Variable Name               |                Description                |          Get it from          |
| :---------------------------------------: | :---------------------------------------: | :---------------------------: |
|   NATURAL_LANGUAGE_UNDERSTANDING_APIKEY   |            IBM Watson API KEY             |    https://cloud.ibm.com/     |
| NATURAL_LANGUAGE_UNDERSTANDING_IAM_APIKEY |          IBM Watson IAM API KEY           |    https://cloud.ibm.com/     |
|    NATURAL_LANGUAGE_UNDERSTANDING_URL     |        IBM Watson NLU Service URL         |    https://cloud.ibm.com/     |
| NATURAL_LANGUAGE_UNDERSTANDING_AUTH_TYPE  |         IBM Watson NLU Auth Type          |    https://cloud.ibm.com/     |
|                NEWS_APIKEY                |              NEWSAPI API KEY              |  https://newsapi.org/account  |
|                   DBURI                   |    URI for connecting to MongoDB Atlas    |  https://cloud.mongodb.com/   |
|                JWT_SECRET                 |              JWT Secret Key               | You can generate your own key |
|             SENDGRID_API_KEY              |             Sendgrid API KEY              |   https://app.sendgrid.com/   |
|              SENDGRID_EMAIL               | Email for sending out mails from Sendgrid |   https://app.sendgrid.com/   |

```
npm start
```

## Tech Stack

- MongoDB, ExpressJS, React, NodeJS (MERN)
- SendGrid for sending emails
- IBM Watson NLU Library
- Heroku for backend deployment
- Netlify for frontend deployment
- News API
- Crypyto News API
- Axios 
- Material UI
