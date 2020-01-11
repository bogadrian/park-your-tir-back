const mongoose = require('mongoose');
const slugify = require('slugify');

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        'Pleasse give a name to this parking place'
      ],
      unique: true,
      trim: true
    },
    placeAuthor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      maxlength: 1
    },
    slug: String,
    description: {
      type: String,
      required: [
        true,
        'Add a short description to this place'
      ],
      trim: true
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A place must have at least 1 point rating'],
      max: [5, 'A place can have maximum 5 points rating'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    images: [String],
    position: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  //enable virtual fileds
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//add index for slugs in order to help the query for a specific place
placeSchema.index({ slug: 1 });
placeSchema.index({ position: '2dsphere' });

//populae virtualy a place with all commnets beloging to it
placeSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'place',
  localField: '_id'
});

// populate the place with the author (this happens on query itsels)
placeSchema.pre(/^find/, function(next) {
  this.populate({ path: 'placeAuthor', select: '-__v' });

  next();
});

// mongoose pre - save middleawre to be runned before saving. add a slug. create a slug from place name (you need it to use in a url pointer to that place)
placeSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
