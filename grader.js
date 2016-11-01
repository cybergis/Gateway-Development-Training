// Depend on mocha, chai, chai-http

var url = require('url');
var path = require('path');
var _ = require('lodash');
var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

var host = 'http://localhost:3000';
var endpoint = '/rest/v1';

function getDigit (val, index) {
  var result = val;
  if (index < 0) {
    //! Skipped for now.
  } else {
    result = Math.floor(result / Math.pow(10, index)) % 10;
  }
  return result;
}

function validateDateString (str) {
  return (new Date(str)).toJSON() === str;
}

function validateSelfLink (obj, expectedSelfPath) {
  expect(obj).to.be.an('object')
  .and.have.property('self');
  expect(obj.self).to.be.a('string')
  .and.not.empty;
  if (typeof expectedSelfPath !== 'undefined') {
    expect(url.parse(obj.self).pathname).to.equal(expectedSelfPath);
  }
  return true;
}

function validateRelationObject (obj, type, id) {
  expect(obj).to.be.an('object')
  .and.have.property('data');
  expect(obj.data).to.have.property('type', type);
  expect(obj.data).to.have.property('id', id);
  return true;
}

/**
 * @param {Object.<Type, ID>} mustInclude
 * @param {Array} ary
 * @return {boolean}
 */
function validateIncludedArray (mustInclude, ary) {
  expect(ary).to.be.an('array');
  var counts = {};
  Object.keys(mustInclude).forEach(function (type) {
    counts[type] = 0;
  });
  ary.forEach(function (obj) {
    expect(obj).to.be.an('object');
    if (typeof counts[obj.type] !== 'undefined' && obj.id === mustInclude[obj.type]) {
      counts[obj.type]++;
    }
  });
  expect(Object.keys(counts).every(function (type) {
    return counts[type] === 1;
  })).to.be.true;

  return true;
}

// Tests start.

describe('App', function() {
	it('should be online', function (done) {
		chai.request(host)
      .get('/')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.html;

        done();
      });
	});

  var savedMovies = [],
      savedSchedules = [];

	describe('/movies', function() {
	  var selfPath;

    before(function() {
      selfPath = path.join(endpoint, 'movies');
    });

    it('should list all scheduled movies', function (done) {
      chai.request(host)
        .get(selfPath)
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');

          // Check links.
          expect(res.body).to.have.property('links')
            .that.satisfy(_.partialRight(validateSelfLink, selfPath));

          // Check data.
          expect(res.body).to.have.property('data')
            .that.is.an('array')
            .and.have.length.of.at.least(1);

          res.body.data.every(function (movie) {
            expect(movie).to.be.an('object')
            .and.have.property('type', 'movies');

            expect(movie).to.have.property('id')
              .that.is.a('string')
              .and.not.empty;

            // Check data item attributes.
            expect(movie).to.have.property('attributes')
              .that.is.an('object');

            // Every movie has to have a non-empty title.
            expect(movie.attributes).to.have.property('title')
              .that.is.a('string')
              .and.not.empty;

            // Every movie has to have a date for the most recent schedule.
            expect(movie.attributes).to.have.property('mostRecentScheduleAt')
              // Verify it's a Date-compatible string.
              .that.is.a('string')
              .and.satisfy(validateDateString);

            // Check data item relationships.
            expect(movie).to.have.property('relationships')
              .that.is.an('object');

            expect(movie.relationships).to.have.property('schedules')
              .that.is.an('object')
              .and.have.property('links')
                .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', movie.id, 'schedules')));

            // Check data item link.
            expect(movie).to.have.property('links')
              .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', movie.id)));

            return true;
          });

          // Movies have to be sorted by `mostRecentScheduleAt` in ascending order.
          res.body.data.reduce(function (a, b) {
            var dateA = new Date(a.attributes.mostRecentScheduleAt),
                dateB = new Date(b.attributes.mostRecentScheduleAt);
            expect(dateA).to.be.most(dateB);
            return b;
          });
          
          // Save the movies for the next tests.
          savedMovies = res.body.data.map(function (movie) {
            return {
              title: movie.attributes.title,
              id: movie.id,
              mostRecentScheduleAt: new Date(movie.attributes.mostRecentScheduleAt),
              scheduleLink: movie.relationships.schedules.links.self
            };
          });

          done();
        });
    });

    it('should return 4** for posts', function (done) {
      chai.request(host)
        .post(selfPath)
        .end(function (err, res) {
          expect(err).to.not.be.null;
          // statusCode should be 4**.
          expect(getDigit(res.statusCode, 2)).to.equal(4);
          expect(res).to.be.json;

          done();
        });
    });

	});

	describe('/movies/<someMovieId>/schedules', function() {
	  var movie, selfPath;

    before(function() {
      movie = savedMovies[0];
      selfPath = path.join(endpoint, 'movies', movie.id, 'schedules');
    });

    it('should list all schedules of the selected movie', function (done) {
      chai.request(host)
        .get(selfPath)
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');

          // Check links.
          expect(res.body).to.have.property('links')
            .that.satisfy(_.partialRight(validateSelfLink, selfPath));

          // Check data.
          expect(res.body).to.have.property('data')
            .that.is.an('array')
            .and.have.length.of.at.least(1);

          res.body.data.every(function (schedule) {
            expect(schedule).to.be.an('object')
            .and.have.property('type', 'schedules');

            expect(schedule).to.have.property('id')
              .that.is.a('number')
              .and.not.empty;

            // Check data item attributes.
            expect(schedule).to.have.property('attributes')
              .that.is.an('object');

            // Every schedule has to have a start date.
            expect(schedule.attributes).to.have.property('startAt')
              .that.is.a('string')
              .and.satisfy(validateDateString);

            // Every schedule has to have a price.
            expect(schedule.attributes).to.have.property('price')
              .that.is.a('number');

            // Check data item relationships.
            expect(schedule).to.have.property('relationships')
              .that.is.an('object');

            expect(schedule.relationships).to.have.property('movie')
              .that.is.an('object')
              .and.satisfy(_.partialRight(validateRelationObject, 'movies', movie.id));

            expect(schedule.relationships).to.have.property('rooms')
              .that.is.an('object')
              .and.have.property('links')
                .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', movie.id, 'schedules', String(schedule.id), 'rooms')));

            // Check data item link.
            expect(schedule).to.have.property('links')
              .that.satisfy(validateSelfLink);

            return true;
          });

          // Schedules has to be sorted by `startAt` in ascending order.
          res.body.data.reduce(function (a, b) {
            var dateA = new Date(a.attributes.startAt),
                dateB = new Date(b.attributes.startAt);
            expect(dateA).to.be.most(dateB);
            return b;
          });

          // Save the schedules for the next tests.
          savedSchedules = res.body.data.map(function (schedule) {
            return {
              startAt: schedule.attributes.startAt,
              id: schedule.id,
              roomLink: schedule.relationships.rooms.links.self
            };
          });

          // Check included.
          expect(res.body).to.have.property('included')
            .that.is.an('array')
            .and.satisfy(_.partial(validateIncludedArray, {
              movies: movie.id
            }));

          done();
        });
    });

    it('should return 4** for posts', function (done) {
      chai.request(host)
        .post(selfPath)
        .end(function (err, res) {
          expect(err).to.not.be.null;
          // statusCode should be 4**.
          expect(getDigit(res.statusCode, 2)).to.equal(4);
          expect(res).to.be.json;

          done();
        });
    });

  });

});
