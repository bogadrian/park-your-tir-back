// this is an Api future where some query are executed. sort(), filter(), limitFields(), paginate(). it works with every data model. every method is independent from others, works as stand alone method. In this example this module is imported in tourController for the get all tours function. overthere this operation has sense to be perfomered. it may be in get all user also, but it does not make much sense overthere.
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  //MONGOOSE METHDOES: query.sort('sort the result by given query').select('select the results by given fields').skip('skip number of results').limit('limit the nuber of results')

  filter() {
    // mutate the original req.query object in order to exclude some parametres. It is necessary in case some page or sort or limit page filed is sent in req.query.
    //Ex: /api/v1/places?name="something"&coordinates="num, num"
    const queryObj = { ...this.queryString };
    const deleteQueries = [
      'limit',
      'page',
      'sort',
      'fields'
    ];
    deleteQueries.forEach(el => delete queryObj[el]);

    // replace gt, gte, lt, lte - which comes with request object, with $gte, $gt, $lte, $lt to much the mongoose operator
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(lt|lte|gt|gte)\b/g,
      match => `$${match}`
    );

    //call find mongosse method with the filtred request object here
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    //sort - split the req.query.sort by comma and join it back by space as required in mongooose
    //Ex: /api/v1/places?ratingsAverage="4.9"
    if (this.queryString.sort) {
      const sortedBy = this.queryString.sort
        .split(',')
        .join(' ');
      this.query = this.query.sort(sortedBy);
      //set a default sorting
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    //limit fields sent back to client by fields query
    //EX: include only name by example
    //  api/v1/places?fields="name"
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .join(' ');
      this.query = this.query.select(fields);
      // set default - set also select to false in Schema in order to not expose creataedAt to client
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    //Pagination
    // EX: api/v1/places?page=2&limit=10
    //page is the page required multiplied by 1 to make it a number, or simple page 1 default
    const page = this.queryString.page * 1 || 1;
    //limit is the limit required or simply 100 results per page by default
    const limit = this.queryString.limit * 1 || 100;
    // skip is the page required minus 1 to go back by amount of limit (for page 3 by example we need result from 21 to 30) and then multiply by limit to get result for that page
    const skip = (page - 1) * limit;

    // use skip mongoose method and limit to get pages
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
