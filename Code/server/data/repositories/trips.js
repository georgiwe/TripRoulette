var Trip = require('mongoose').model('Trip'),
constants = require('../../utils/constants'),
messages = require('../../utils/messages'),
Promise = require('bluebird'),
_ = require('underscore');

function findById(id) {
  var promise = new Promise(function (resolve, reject) {
    Trip.findById(id)
    .populate('passengers driver')
    .exec(function (err, trip) {
      if (err) reject(err);
      else resolve(trip);
    });
  });
  return promise;
}

function getAll() {
  var promise = new Promise(function (resolve, reject) {
    Trip.find({}, function (err, trips) {
      if (err) reject(err);
      else resolve(trips);
    });
  });
  return promise;
}

function save(tripData) {
  var promise = new Promise(function (resolve, reject) {
    new Trip(tripData).save(function (err, savedTrip) {
      if (err) return reject(err);
      else resolve(savedTrip);
    });
  });
  return promise
}

function findByDriverId(id) {
  var promise = new Promise(function (resolve, reject) {
    Trip
    .find()
    .populate('driver')
    .where('driver.id').equals(id)
    .exec(function (err, trips) {
      if (err) reject(err);
      else resolve(trips);
    });
  });
  return promise;
}

function findDepartingAfter(date) {
  var promise = new Promise(function (resolve, reject) {
    Trip
    .find()
    .where('departure').gte(date)
    .sort('departure')
    .exec(function (err, trips) {
      if (err) reject(err);
      else resolve(trips);
    });
  });
  return promise;
}

function addPassenger(tripId, passengerId) {
  var promise = new Promise(function (resolve, reject) {
    Trip.findById(tripId, function (err, trip) {
      if (err) return reject(err);
      if (!trip) return reject(new Error(messages.tripNotFound));

      trip.passengers.push(passengerId);
      trip.freeSeats -= 1;
      trip.save(function (err, savedTrip) {
        if (err) reject(err);
        else resolve(savedTrip);
      });
    });
  });
  return promise;
}

function update(tripId, tripData) {
  var promise = new Promise(function (resolve, reject) {
    Trip.findById(tripId, function (err, trip) {
      if (err) return reject(err);
      if (!trip) return reject(new Error(messages.tripNotFound));

      _.extend(trip, tripData);

      trip.save(function (err, savedTrip) {
        if (err) reject(err);
        else resolve(savedTrip);
      });
    });
  });
  return promise;
}

function filter(options) {
  var from = options.from ? options.from.toTitleCase() : undefined;
  var to = options.to ? options.to.toTitleCase() : undefined;
  options.page = options.page || 1;
  // options.pageSize = options.pageSize || constants.PAGE_SIZE;

  var promise = new Promise(function (resolve, reject) {
    var query = Trip.find()
    .where('departure').gte(options.departureAfter || new Date());

    if (from)
      query.where('from').equals(from);
    if (to)
      query.where('to').equals(to);
    if (options.freeSeats)
      query.where('freeSeats').gte(options.freeSeats || 0);
    if (options.driverId)
      query.where('driver').equals(options.driverId);

    query
    .sort(options.sort || 'departure')
    .skip((options.page - 1) * options.pageSize)
    .limit(options.pageSize)
    .populate('driver', '-trips -interestCities')
    .populate('passengers', '_id firstName lastName username');

    query.exec(function (err, results) {
      if (err) reject(err);
      else resolve(results);
    });
  });
  return promise;
}

module.exports = {
  repoName: 'trips',
  dataAccess: {
    getAll: getAll,
    findById: findById,
    save: save,
    findByDriverId: findByDriverId,
    findDepartingAfter: findDepartingAfter,
    addPassenger: addPassenger,
    update: update,
    filter: filter
  }
};