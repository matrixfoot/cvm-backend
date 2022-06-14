const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('./models/user');

const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://cvmadmin:edPUCHw2Ha4l5KP4@cluster0.bp2jrmc.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization,x-access-token');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );
  app.use(async (req, res, next) => {
    if (req.headers["x-access-token"] ) {
      try {
        const accessToken = req.headers["x-access-token"];
        const { userId, exp } = await jwt.verify(accessToken, 'RANDOM_TOKEN_SECRET');
        // If token has expired
        if (exp < Date.now().valueOf() / 1000) {
          return res.status(401).json({
            error: "JWT token has expired, please login to obtain a new one"
          });
        }
        res.locals.loggedInUser = await User.findById(userId);
        next();
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  });


 app.use('/api/users', userRoutes);
 app.use('/api', userRoutes);

module.exports = app;