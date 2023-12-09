require('dotenv').config();
const express = require('express');
const cors = require('cors');


const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js')
const agentRoutes = require('./routes/agentRoutes.js')
const companyRoutes = require('./routes/companyRoutes.js')
const templateRoutes = require('./routes/templateRoutes.js')
const campaignRoutes = require('./routes/campaignRoutes.js')
const customerRoutes = require('./routes/customerRoutes.js')
const groupRoutes = require('./routes/groupRoutes.js')
const webhookRoutes = require('./routes/webhookRoutes.js')

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { setGlobalOptions } = require("firebase-functions/v2");

// Set global options for Firebase Functions
setGlobalOptions({
  maxInstances: 5,
});

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth',authRoutes)
app.use('/admin',adminRoutes)
app.use('/agent',agentRoutes)
app.use('/company',companyRoutes)
app.use('/template',templateRoutes)
app.use('/campaign',campaignRoutes)
app.use('/customer',customerRoutes)
app.use('/group',groupRoutes)
app.use('/webhook',webhookRoutes)


exports.webhook = onRequest(app);

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.json({
    message: "HIII",
  });
});



app.listen(process.env.PORT, () => console.log('Server started', process.env.PORT));
