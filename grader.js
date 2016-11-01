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

describe('App', function () {
  var theMovie, theSchedule, theRoom, theSeat;

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

  describe('list all scheduled movies', function () {

    var selfPath, response;

    before(function () {
      selfPath = path.join(endpoint, 'movies');
    });

    describe('Endpoint', function () {

      it('should send some data to get requests', function (done) {
        chai.request(host)
          .get(selfPath)
          .end(function (err, res) {
            expect(err).to.be.null;
            response = res;
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

    describe('response', function () {

      it('should have status code 200', function () {
        expect(response).to.have.status(200);
      });

      it('should have content in JSON', function () {
        expect(response).to.be.json;
      });

      it('should have an object in body', function () {
        expect(response).to.be.an('object');
      });

      describe('response body', function () {

        it('should have property "links"', function () {
          expect(response.body).to.have.property('links');
        });

        it('should have property "data"', function () {
          expect(response.body).to.have.property('data');
        });

        describe('links', function () {

          it('should point to this page', function () {
            expect(response.body.links).to.satisfy(_.partialRight(validateSelfLink, selfPath));
          });

        });

        describe('data', function () {

          it('should be a list with at least one item', function () {
            expect(response.body.data).to.be.an('array')
            .and.have.length.of.at.least(1);
          });

          describe('every item', function () {

            it('should be an object with type "movies"', function () {
              response.body.data.every(function (movie) {
                expect(movie).to.be.an('object')
                .and.have.property('type', 'movies');
                return true;
              });
            });

            it('should have a string type property "id" that is not empty', function () {
              response.body.data.every(function (movie) {
                expect(movie).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
                return true;
              });
            });

            it('should have an object type property "attributes"', function () {
              response.body.data.every(function (movie) {
                expect(movie).to.have.property('attributes')
                  .that.is.an('object');
                return true;
              });
            });

            it('should have an object type property "relationships"', function () {
              response.body.data.every(function (movie) {
                expect(movie).to.have.property('relationships')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "attributes"', function () {

              it('should have a string type property "title" that is not empty', function () {
                response.body.data.every(function (movie) {
                  expect(movie.attributes).to.have.property('title')
                    .that.is.a('string')
                    .and.not.empty;
                  return true;
                });
              });

              it('should have a string type property "mostRecentScheduleAt" that represents a date', function () {
                response.body.data.every(function (movie) {
                  expect(movie.attributes).to.have.property('mostRecentScheduleAt')
                    // Verify it's a Date-compatible string.
                    .that.is.a('string')
                    .and.satisfy(validateDateString);
                  return true;
                });
              });

            });

            describe('property "relationships"', function () {

              it('should have an object type property "schedules" that links to the schedules page', function () {
                response.body.data.every(function (movie) {
                  expect(movie.relationships).to.have.property('schedules')
                    .that.is.an('object')
                    .and.have.property('links')
                      .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', movie.id, 'schedules')));
                  return true;
                });
              });

            });

            describe('property "links"', function () {

              it('should point to the item', function () {
                response.body.data.every(function (movie) {
                  expect(movie).to.have.property('links')
                    .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', movie.id)));
                  return true;
                });
              });

            });

          });

          describe('all items', function () {

            it('should be sorted by the time of the most recent schedule in ascending order', function () {
              response.body.data.reduce(function (a, b) {
                var dateA = new Date(a.attributes.mostRecentScheduleAt),
                    dateB = new Date(b.attributes.mostRecentScheduleAt);
                expect(dateA).to.be.most(dateB);
                return b;
              });

              // Save the movie for the next tests.
              theMovie = response.body.data[0];
            });

          });

        });

      });
    });

  });

	describe('/movies/<someMovieId>/schedules', function () {
	  var selfPath;

    before(function () {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules');
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
              .that.is.a('string')
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
              .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));

            expect(schedule.relationships).to.have.property('rooms')
              .that.is.an('object')
              .and.have.property('links')
                .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', schedule.id, 'rooms')));

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

          // Save the schedule for the next tests.
          theSchedule = res.body.data[0];

          // Check included.
          expect(res.body).to.have.property('included')
            .that.is.an('array')
            .and.satisfy(_.partial(validateIncludedArray, {
              movies: theMovie.id
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

  describe.skip('/movies/<someMovieId>/schedules/<someScheduleId>/rooms', function () {
	  var selfPath;

    before(function () {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms');
    });

    it('should list all rooms of the selected schedule of the selected movie');

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

  describe.skip('/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats[?sort&filter]', function () {
    var selfPath;

    before(function () {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats');
    });

    it('should list all seats of the selected room for the selected schedule of the selected movie');

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

  describe.skip('/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>', function () {
    var selfPath;

    before(function () {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id);
    });

    it('should show availability of the selected seat of the selected room for the selected schedule of the selected movie');

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

  describe.skip('/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>/order', function () {
    var selfPath;

    before(function () {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id);
    });

    it('should book the selected seat of the selected room for the selected schedule of the selected movie');

    it('should return 4** for gets', function (done) {
      chai.request(host)
        .get(selfPath)
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
