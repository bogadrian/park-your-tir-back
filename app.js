const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');
const compression = require('compression');
const cors = require('cors');

const placesRouter = require('./routes/placesRoutes');
const userRouter = require('./routes/userRoutes');
const commentsRouter = require('./routes/commentsRoutes');
const globalErrorHandler = require('./controllers/errorController');

const AppError = require('./utilis/AppError');

const app = express();

// Middleware Stack
//set http secure headers with helmet
app.use(helmet());

//list of allowed domains to make request
// const whitelist = [
//   'http://localhost:3006',
//   `http://localhost:${'*'}`
// ];
// const corsOptions = {
//   origin: function(origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new AppError('Not allowed by CORS', 403));
//     }
//   }
// };
// Serving static files
app.use(
  '/api/v1/',
  express.static(path.join(__dirname, 'public'))
);

app.use(cors());

// set morgan tu run only in development enviroment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API 10 100 per hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// set express.json() middleware in oreder to have access to req.body data. Limit the amopunt of data caoming in with req.body at only 10kb
app.use(express.json({ limit: '10kb' }));
app.use(
  express.urlencoded({ extended: true, limit: '10kb' })
);
// allow cookie to be read
app.use(cookieParser());

//protect agians nosql query injection with
app.use(mongoSanitize());

//protect agains xss atacks. don't allow malicious html to be sent in req.body
app.use(xss());

//Prevent parameter query pollution
app.use(
  hpp({
    whitelist: ['ratingsAverage', 'ratingsQuantity']
  })
);

// another middlware which adds a date reate at time on req object and save it with it
app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  next();
});

//add compression to middleware stack in order to compress text files
app.use(compression());

// Routes
// the routes mountig for tours and users. they have access to tour Router and userRouter files where the endpoints are defined

app.use('/api/v1/places', placesRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/comments', commentsRouter);

// route handler for all the endpoints misteken
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this path!`,
      404
    )
  );
});

// error handler function, to be called by next(err, status Code ) sintax from everywhere
app.use(globalErrorHandler);

// export the app in order to make it availble in routes files
module.exports = app;
