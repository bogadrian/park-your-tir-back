//const Place = require('../models/placesModel');
const User = require('../models/userModel');
const catchAsync = require('../utilis/catchAsync');
//const AppError = require('../utilis/AppError');

// exports.alerts = (req, res, next) => {
//   const { alert } = req.query;
//   if (alert === 'booking')
//     res.locals.alert =
//       "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
//   next();
// };

// exports.getOverview = catchAsync(async (req, res, next) => {
//   // 1) Get tour data from collection
//   const place = await Place.find();

//   // 2) Build template
//   // 3) Render that template using tour data from 1)
//   res.status(200).json({
//     title: 'All Places',
//     place
//   });
// });

// exports.getPlace = catchAsync(async (req, res, next) => {
//   // 1) Get the data, for the requested tour (including reviews and guides)
//   const place = await Place.findOne({
//     slug: req.params.slug
//   }).populate({
//     path: 'comments',
//     fields: 'comments user'
//   });

//   if (!place) {
//     return next(
//       new AppError('There is no place with that name.', 404)
//     );
//   }

//   // 2) Build template
//   // 3) Render template using data from 1)
//   res.status(200).render('place', {
//     title: `${place.name} Tour`,
//     place
//   });
// });

// exports.getLoginForm = (req, res) => {
//   res.status(200).render('login', {
//     title: 'Log into your account'
//   });
// };

// exports.getAccount = (req, res) => {
//   res.status(200).render('account', {
//     title: 'Your account'
//   });
// };

// exports.getMyPlaces = catchAsync(async (req, res, next) => {
//   // 1) Find all bookings
//   const bookings = await Booking.find({ user: req.user.id });

//   // 2) Find tours with the returned IDs
//   const tourIDs = bookings.map(el => el.tour);
//   const tours = await Tour.find({ _id: { $in: tourIDs } });

//   res.status(200).render('overview', {
//     title: 'My Tours',
//     tours
//   });
// });

exports.updateUserData = catchAsync(
  async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  }
);
