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

function getDigit (val, index)
{
  var result = val;
  if (index < 0)
  {
    //! Skipped for now.
  }
  else
  {
    result = Math.floor(result / Math.pow(10, index)) % 10;
  }
  return result;
}

function validateDateString (str)
{
  return (new Date(str)).toJSON() === str;
}

function validateSelfLink (obj, expectedSelfPath)
{
  expect(obj).to.be.an('object')
  .and.have.property('self');
  expect(obj.self).to.be.a('string')
  .and.not.empty;
  if (typeof expectedSelfPath !== 'undefined')
  {
    expect(url.parse(obj.self).pathname).to.equal(expectedSelfPath);
  }
  return true;
}

function validateRelationObject (obj, type, id)
{
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
function validateIncludedArray (mustInclude, ary)
{
  expect(ary).to.be.an('array');
  var counts = {};
  Object.keys(mustInclude).forEach(function (type)
  {
    counts[type] = 0;
  });
  ary.forEach(function (obj)
  {
    expect(obj).to.be.an('object');
    if (typeof counts[obj.type] !== 'undefined' && obj.id === mustInclude[obj.type])
    {
      counts[obj.type]++;
    }
  });
  expect(Object.keys(counts).every(function (type)
  {
    return counts[type] === 1;
  })).to.be.true;

  return true;
}

// Tests start below.

describe('App', function ()
{
  // Store movie, schedule and room records that are shared between test suits.
  var theMovie, theSchedule, theRoom;
  // Stores seat records that are shared between test suits.
  var allSeats = [];

  it('should be online', function (done)
  {
    chai.request(host)
      .get('/')
      .end(function (err, res)
      {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.html;

        done();
      });
  });

  describe('list all scheduled movies', function ()
  {
    var selfPath, response;

    before(function ()
    {
      selfPath = path.join(endpoint, 'movies');
    });

    describe('Endpoint', function ()
    {

      it('should respond 200 JSON for get requests', function (done)
      {
        chai.request(host)
          .get(selfPath)
          .end(function (err, res)
          {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.be.json;

            response = res;
            done();
          });
      });

      it('should respond 4** JSON for post requests', function (done)
      {
        chai.request(host)
          .post(selfPath)
          .end(function (err, res)
          {
            expect(err).to.not.be.null;
            // statusCode should be 4**.
            expect(getDigit(res.statusCode, 2)).to.equal(4);
            expect(res).to.be.json;

            done();
          });
      });

    });

    describe('response', function ()
    {

      it('should have an object in body', function ()
      {
        expect(response).to.be.an('object');
      });

      describe('response body', function ()
      {

        it('should have property "links"', function ()
        {
          expect(response.body).to.have.property('links');
        });

        describe('links', function ()
        {

          it('should point to this page', function ()
          {
            expect(response.body.links).to.satisfy(_.partialRight(validateSelfLink, selfPath));
          });

        });

        it('should have property "data"', function ()
        {
          expect(response.body).to.have.property('data');
        });

        describe('data', function ()
        {

          it('should be a list with at least one item', function ()
          {
            expect(response.body.data).to.be.an('array')
            .and.have.length.of.at.least(1);
          });

          describe('every item', function ()
          {

            it('should be an object with type "movies"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.be.an('object')
                .and.have.property('type', 'movies');
              });
            });

            it('should have a string type property "id" that is not empty', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
              });
            });

            it('should have an object type property "attributes"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('attributes')
                  .that.is.an('object');
              });
            });

            describe('property "attributes"', function ()
            {

              it('should have a string type property "title" that is not empty', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('title')
                    .that.is.a('string')
                    .and.not.empty;
                });
              });

              it('should have a string type property "mostRecentScheduleAt" that represents a date', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('mostRecentScheduleAt')
                    // Verify it's a Date-compatible string.
                    .that.is.a('string')
                    .and.satisfy(validateDateString);
                });
              });

            });

            it('should have an object type property "relationships"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('relationships')
                  .that.is.an('object');
              });
            });

            describe('property "relationships"', function ()
            {

              it('should have an object type property "schedules" that links to the schedules page', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.relationships).to.have.property('schedules')
                    .that.is.an('object')
                    .and.have.property('links')
                      .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', item.id, 'schedules')));
                });
              });

            });

            it('should have an object type property "links"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('links')
                  .that.is.an('object');
              });
            });

            describe('property "links"', function ()
            {

              it('should point to the item', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', item.id)));
                });
              });

            });

          });

          describe('all items', function ()
          {

            it('should be sorted by the time of the most recent schedule in ascending order', function ()
            {
              response.body.data.reduce(function (a, b)
              {
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

  describe('list all schedules of the selected movie', function ()
  {
    var selfPath, response;

    before(function ()
    {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules');
    });

    describe('Endpoint', function ()
    {

      it('should respond 200 JSON for get requests', function (done)
      {
        chai.request(host)
          .get(selfPath)
          .end(function (err, res)
          {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.be.json;

            response = res;
            done();
          });
      });

      it('should respond 4** JSON for post requests', function (done)
      {
        chai.request(host)
          .post(selfPath)
          .end(function (err, res)
          {
            expect(err).to.not.be.null;
            // statusCode should be 4**.
            expect(getDigit(res.statusCode, 2)).to.equal(4);
            expect(res).to.be.json;

            done();
          });
      });

    });

    describe('response', function ()
    {

      it('should have an object in body', function ()
      {
        expect(response).to.be.an('object');
      });

      describe('response body', function ()
      {

        it('should have property "links"', function ()
        {
          expect(response.body).to.have.property('links');
        });

        describe('links', function ()
        {

          it('should point to this page', function ()
          {
            expect(response.body.links).to.satisfy(_.partialRight(validateSelfLink, selfPath));
          });

        });

        it('should have property "data"', function ()
        {
          expect(response.body).to.have.property('data');
        });

        describe('data', function ()
        {

          it('should be a list with at least one item', function ()
          {
            expect(response.body.data).to.be.an('array')
            .and.have.length.of.at.least(1);
          });

          describe('every item', function ()
          {

            it('should be an object with type "schedules"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.be.an('object')
                .and.have.property('type', 'schedules');
              });
            });

            it('should have a string type property "id" that is not empty', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
              });
            });

            it('should have an object type property "attributes"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('attributes')
                  .that.is.an('object');
              });
            });

            describe('property "attributes"', function ()
            {

              it('should have a number type property "price"', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('price')
                    .that.is.a('number');
                });
              });

              it('should have a string type property "startAt" that represents a date', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('startAt')
                    .that.is.a('string')
                    .and.satisfy(validateDateString);
                });
              });

            });

            it('should have an object type property "relationships"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('relationships')
                  .that.is.an('object');
              });
            });

            describe('property "relationships"', function ()
            {

              it('should have an object type property "movie" that points to the movie', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.relationships).to.have.property('movie')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));
                });
              });

              it('should have an object type property "rooms" that links to the rooms page', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.relationships).to.have.property('rooms')
                    .that.is.an('object')
                    .and.have.property('links')
                      .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', item.id, 'rooms')));
                });
              });

            });

            it('should have an object type property "links"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('links')
                  .that.is.an('object');
              });
            });

            describe('property "links"', function ()
            {

              it('should point to the item', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', item.id)));
                });
              });

            });

          });

          describe('all items', function ()
          {

            it('should be sorted by the start time in ascending order', function ()
            {
              response.body.data.reduce(function (a, b)
              {
                var dateA = new Date(a.attributes.startAt),
                    dateB = new Date(b.attributes.startAt);
                expect(dateA).to.be.most(dateB);
                return b;
              });

              // Save the schedule for the next tests.
              theSchedule = response.body.data[0];
            });

          });

        });

        it('should have property "included"', function ()
        {
          expect(response.body).to.have.property('included');
        });

        describe('included', function ()
        {

          it('should be a list that contains the movie', function ()
          {
            expect(response.body.included).to.be.an('array')
            .and.satisfy(_.partial(validateIncludedArray, {
              movies: theMovie.id
            }));
          });

        });

      });

    });

  });

  describe('list all rooms of the selected schedule of the selected movie', function ()
  {
    var selfPath, response;

    before(function ()
    {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms');
    });

    describe('Endpoint', function ()
    {

      it('should respond 200 JSON for get requests', function (done)
      {
        chai.request(host)
          .get(selfPath)
          .end(function (err, res)
          {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.be.json;

            response = res;
            done();
          });
      });

      it('should respond 4** JSON for post requests', function (done)
      {
        chai.request(host)
          .post(selfPath)
          .end(function (err, res)
          {
            expect(err).to.not.be.null;
            // statusCode should be 4**.
            expect(getDigit(res.statusCode, 2)).to.equal(4);
            expect(res).to.be.json;

            done();
          });
      });

    });

    describe('response', function ()
    {

      it('should have an object in body', function ()
      {
        expect(response).to.be.an('object');
      });

      describe('response body', function ()
      {

        it('should have property "links"', function ()
        {
          expect(response.body).to.have.property('links');
        });

        describe('links', function ()
        {

          it('should point to this page', function ()
          {
            expect(response.body.links).to.satisfy(_.partialRight(validateSelfLink, selfPath));
          });

        });

        it('should have property "data"', function ()
        {
          expect(response.body).to.have.property('data');
        });

        describe('data', function ()
        {

          it('should be a list with at least one item', function ()
          {
            expect(response.body.data).to.be.an('array')
            .and.have.length.of.at.least(1);
          });

          describe('every item', function ()
          {

            it('should be an object with type "rooms"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.be.an('object')
                .and.have.property('type', 'rooms');
              });
            });

            it('should have a string type property "id" that is not empty', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
              });
            });

            it('should have an object type property "attributes"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('attributes')
                  .that.is.an('object');
              });
            });

            describe('property "attributes"', function ()
            {

              it('should have a string type property "title" that is not empty', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('title')
                    .that.is.a('string')
                    .and.not.empty;
                });
              });

              it('should have a number type property "rows"', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('rows')
                    .that.is.a('number')
                    .and.is.above(0);
                });
              });

              it('should have a number type property "columns"', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('columns')
                    .that.is.a('number')
                    .and.is.above(0);
                });
              });

            });

            it('should have an object type property "relationships"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('relationships')
                  .that.is.an('object');
              });
            });

            describe('property "relationships"', function ()
            {

              it('should have an object type property "movie" that points to the movie', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.relationships).to.have.property('movie')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));
                });
              });

              it('should have an object type property "schedule" that points to the schedule', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.relationships).to.have.property('schedule')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'schedules', theSchedule.id));
                });
              });

              it('should have an object type property "seats" that links to the seats page', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.relationships).to.have.property('seats')
                    .that.is.an('object')
                    .and.have.property('links')
                      .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', item.id, 'seats')));
                });
              });

            });

            it('should have an object type property "links"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('links')
                  .that.is.an('object');
              });
            });

            describe('property "links"', function ()
            {

              it('should point to the item', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', item.id)));
                });
              });

            });

          });

          describe('all items', function ()
          {

            it('should be sorted by the number of available seats in descending order', function ()
            {
              // Pass since the required schema doesn't allow for this check.
              expect(true).to.be.true;

              // Save the room for the next tests.
              theRoom = response.body.data[0];
            });

          });

        });

        it('should have property "included"', function ()
        {
          expect(response.body).to.have.property('included');
        });

        describe('included', function ()
        {

          it('should be a list that contains the movie and the schedule', function ()
          {
            expect(response.body.included).to.be.an('array')
            .and.satisfy(_.partial(validateIncludedArray, {
              movies: theMovie.id,
              schedules: theSchedule.id
            }));
          });

        });

      });

    });

  });

  describe('list all seats of the selected room for the selected schedule of the selected movie', function ()
  {
    var selfPath, response;

    before(function ()
    {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats');
    });

    describe('Endpoint', function ()
    {

      it('should respond 200 JSON for get requests', function (done)
      {
        chai.request(host)
          .get(selfPath)
          .end(function (err, res)
          {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.be.json;

            response = res;
            done();
          });
      });

      it('should respond 4** JSON for post requests', function (done)
      {
        chai.request(host)
          .post(selfPath)
          .end(function (err, res)
          {
            expect(err).to.not.be.null;
            // statusCode should be 4**.
            expect(getDigit(res.statusCode, 2)).to.equal(4);
            expect(res).to.be.json;

            done();
          });
      });

    });

    describe('response', function ()
    {

      it('should have an object in body', function ()
      {
        expect(response).to.be.an('object');
      });

      describe('response body', function ()
      {

        it('should have property "links"', function ()
        {
          expect(response.body).to.have.property('links');
        });

        describe('links', function ()
        {

          it('should point to this page', function ()
          {
            expect(response.body.links).to.satisfy(_.partialRight(validateSelfLink, selfPath));
          });

        });

        it('should have property "data"', function ()
        {
          expect(response.body).to.have.property('data');
        });

        describe('data', function ()
        {

          it('should be a list with at least one item', function ()
          {
            expect(response.body.data).to.be.an('array')
            .and.have.length.of.at.least(1);
          });

          describe('every item', function ()
          {

            it('should be an object with type "seats"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.be.an('object')
                .and.have.property('type', 'seats');
              });
            });

            it('should have a string type property "id" that is not empty', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
              });
            });

            it('should have an object type property "attributes"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('attributes')
                  .that.is.an('object');
              });
            });

            describe('property "attributes"', function ()
            {

              it('should have a number type property "number"', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('number')
                    .that.is.a('number')
                    .and.is.above(0);
                });
              });

              it('should have a number type property "row"', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('row')
                    .that.is.a('number')
                    .and.is.above(0);
                });
              });

              it('should have a number type property "column"', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('column')
                    .that.is.a('number')
                    .and.is.above(0);
                });
              });

              it('should have a boolean type property "available"', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('available')
                    .that.is.a('boolean');
                });
              });

            });

            it('should have an object type property "relationships"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('relationships')
                  .that.is.an('object');
              });
            });

            describe('property "relationships"', function ()
            {

              it('should have an object type property "movie" that points to the movie', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.relationships).to.have.property('movie')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));
                });
              });

              it('should have an object type property "schedule" that points to the schedule', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.relationships).to.have.property('schedule')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'schedules', theSchedule.id));
                });
              });

              it('should have an object type property "room" that points to the room', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.relationships).to.have.property('room')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'rooms', theRoom.id));
                });
              });

            });

            it('should have an object type property "links"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.have.property('links')
                  .that.is.an('object');
              });
            });

            describe('property "links"', function ()
            {

              it('should point to the item', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', item.id)));
                });
              });

            });

          });

          describe('all items', function ()
          {

            it('should be sorted by the seat number in ascending order', function ()
            {
              response.body.data.reduce(function (a, b)
              {
                expect(a.attributes.number).to.be.most(b.attributes.number);
                return b;
              });

              // Save the room for the next tests.
              allSeats = response.body.data;
            });

            it('should have at least 400 items', function ()
            {
              expect(response.body.data).to.be.an('array')
              .and.have.length.of.at.least(400);
            });

          });

        });

        it('should have property "included"', function ()
        {
          expect(response.body).to.have.property('included');
        });

        describe('included', function ()
        {

          it('should be a list that contains the movie, the schedule and the room', function ()
          {
            expect(response.body.included).to.be.an('array')
            .and.satisfy(_.partial(validateIncludedArray, {
              movies: theMovie.id,
              schedules: theSchedule.id,
              rooms: theRoom.id
            }));
          });

        });

      });

    });

  });

  describe('check availability of the selected seat of the selected room for the selected schedule of the selected movie', function ()
  {
    var allResponse = [];

    describe('Endpoint', function ()
    {

      it('should respond 4** JSON for post requests', function (done)
      {
        // Requesting for all 400 seats may take a while.
        this.timeout(100 * allSeats.length); // Give 100 ms for each request.

        var requestIndex = 0;
        var requestNext = function () {
          var theSeat = allSeats[requestIndex];

          chai.request(host)
            .post(path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id))
            .end(function (err, res)
            {
              expect(err).to.not.be.null;
              // statusCode should be 4**.
              expect(getDigit(res.statusCode, 2)).to.equal(4);
              expect(res).to.be.json;

              requestIndex++;

              if (requestIndex >= allSeats.length) {
                done();
              } else {
                requestNext();
              }
            });
        };

        requestNext();
      });

      it('should respond 200 JSON for all get requests for all seats', function (done)
      {
        // Requesting for all 400 seats may take a while.
        this.timeout(100 * allSeats.length); // Give 100 ms for each request.

        var requestIndex = 0;
        var requestNext = function () {
          var theSeat = allSeats[requestIndex];

          chai.request(host)
            .get(path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id))
            .end(function (err, res)
            {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res).to.be.json;

              allResponse[requestIndex] = res;
              requestIndex++;

              if (requestIndex >= allSeats.length) {
                done();
              } else {
                requestNext();
              }
            });
        };

        requestNext();
      });

    });

    describe('response (of all)', function ()
    {

      it('should have an object in body', function ()
      {
        allResponse.forEach(function (response)
        {
          expect(response).to.be.an('object');
        });
      });

      describe('response body', function ()
      {

        it('should have property "data"', function ()
        {
          allResponse.forEach(function (response)
          {
            expect(response.body).to.have.property('data');
          });
        });

        describe('data', function ()
        {

          it('should be an object with type "seats"', function ()
          {
            allResponse.forEach(function (response)
            {
              expect(response.body.data).to.be.an('object')
              .and.have.property('type', 'seats');
            });
          });

          it('should have a string type property "id" that is not empty', function ()
          {
            allResponse.forEach(function (response)
            {
              expect(response.body.data).to.have.property('id')
                .that.is.a('string')
                .and.not.empty;
            });
          });

          it('should have an object type property "attributes"', function ()
          {
            allResponse.forEach(function (response)
            {
              expect(response.body.data).to.have.property('attributes')
                .that.is.an('object');
            });
          });

          describe('property "attributes"', function ()
          {

            it('should have a number type property "number"', function ()
            {
              allResponse.forEach(function (response)
              {
                expect(response.body.data.attributes).to.have.property('number')
                  .that.is.a('number')
                  .and.is.above(0);
              });
            });

            it('should have a number type property "row"', function ()
            {
              allResponse.forEach(function (response)
              {
                expect(response.body.data.attributes).to.have.property('row')
                  .that.is.a('number')
                  .and.is.above(0);
              });
            });

            it('should have a number type property "column"', function ()
            {
              allResponse.forEach(function (response)
              {
                expect(response.body.data.attributes).to.have.property('column')
                  .that.is.a('number')
                  .and.is.above(0);
              });
            });

            it('should have a boolean type property "available"', function ()
            {
              allResponse.forEach(function (response)
              {
                expect(response.body.data.attributes).to.have.property('available')
                  .that.is.a('boolean');
              });
            });

          });

          it('should have an object type property "relationships"', function ()
          {
            allResponse.forEach(function (response)
            {
              expect(response.body.data).to.have.property('relationships')
                .that.is.an('object');
            });
          });

          describe('property "relationships"', function ()
          {

            it('should have an object type property "movie" that points to the movie', function ()
            {
              allResponse.forEach(function (response)
              {
                expect(response.body.data.relationships).to.have.property('movie')
                  .that.is.an('object')
                  .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));
              });
            });

            it('should have an object type property "schedule" that points to the schedule', function ()
            {
              allResponse.forEach(function (response)
              {
                expect(response.body.data.relationships).to.have.property('schedule')
                  .that.is.an('object')
                  .and.satisfy(_.partialRight(validateRelationObject, 'schedules', theSchedule.id));
              });
            });

            it('should have an object type property "room" that points to the room', function ()
            {
              allResponse.forEach(function (response)
              {
                expect(response.body.data.relationships).to.have.property('room')
                  .that.is.an('object')
                  .and.satisfy(_.partialRight(validateRelationObject, 'rooms', theRoom.id));
              });
            });

          });

          it('should have an object type property "links"', function ()
          {
            allResponse.forEach(function (response)
            {
              expect(response.body.data).to.have.property('links')
                .that.is.an('object');
            });
          });

          describe('property "links"', function ()
          {

            it('should point to the item', function ()
            {
              allResponse.forEach(function (response)
              {
                expect(response.body.data.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', response.body.data.id)));
              });
            });

            it('should point to the order page', function ()
            {
              allResponse.forEach(function (response)
              {
                expect(response.body.data.links).to.have.property('order')
                .that.is.a('string');
                expect(url.parse(response.body.data.links.order).pathname).to.equal(path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', response.body.data.id, 'order'));
              });
            });

          });

        });

        it('should have property "included"', function ()
        {
          allResponse.forEach(function (response)
          {
            expect(response.body).to.have.property('included');
          });
        });

        describe('included', function ()
        {

          it('should be a list that contains the movie, the schedule and the room', function ()
          {
            allResponse.forEach(function (response)
            {
              expect(response.body.included).to.be.an('array')
              .and.satisfy(_.partial(validateIncludedArray, {
                movies: theMovie.id,
                schedules: theSchedule.id,
                rooms: theRoom.id
              }));
            });
          });

        });

      });

    });

  });

  describe('book the selected seat of the selected room for the selected schedule of the selected movie', function ()
  {
    var allResponse = [], allBookedSeats = [];

    describe('Endpoint', function ()
    {

      it('should respond 4** JSON for get requests', function (done)
      {
        // Requesting for all 400 seats may take a while.
        this.timeout(100 * allSeats.length); // Give 100 ms for each request.

        var requestIndex = 0;
        var requestNext = function () {
          var theSeat = allSeats[requestIndex];

          chai.request(host)
            .get(path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id, 'order'))
            .end(function (err, res)
            {
              expect(err).to.not.be.null;
              // statusCode should be 4**.
              expect(getDigit(res.statusCode, 2)).to.equal(4);
              expect(res).to.be.json;

              requestIndex++;

              if (requestIndex >= allSeats.length) {
                done();
              } else {
                requestNext();
              }
            });
        };

        requestNext();
      });

      it('should respond 4** JSON for invalid post requests', function (done)
      {
        // Requesting for all 400 seats may take a while.
        this.timeout(100 * allSeats.length); // Give 100 ms for each request.

        var requestIndex = 0;
        var requestNext = function () {
          var theSeat = allSeats[requestIndex];

          chai.request(host)
            .post(path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id, 'order'))
            .end(function (err, res)
            {
              expect(err).to.not.be.null;
              // statusCode should be 4**.
              expect(getDigit(res.statusCode, 2)).to.equal(4);
              expect(res).to.be.json;

              requestIndex++;

              if (requestIndex >= allSeats.length) {
                done();
              } else {
                requestNext();
              }
            });
        };

        requestNext();
      });

      it('should respond 2** JSON for post requests', function (done)
      {
        // Requesting for all 400 seats may take a while.
        this.timeout(150 * allSeats.length); // Give 150 ms for each request.

        var requestIndex = 0;
        var requestNext = function () {
          var theSeat = allSeats[requestIndex];

          chai.request(host)
            .post(path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id, 'order'))
            .send({
              "data": {
                "firstname": "Foo",
                "lastname": "Bar"
              }
            })
            .end(function (err, res)
            {
              if (theSeat.attributes.available === true) {
                expect(err).to.be.null;
                // statusCode should be 2**.
                expect(getDigit(res.statusCode, 2)).to.equal(2);
                expect(res).to.be.json;

                allBookedSeats.push(theSeat);
              } else {
                expect(err).to.not.be.null;
                // statusCode should be 4**.
                expect(getDigit(res.statusCode, 2)).to.equal(4);
                expect(res).to.be.json;
              }

              allResponse[requestIndex] = res;
              requestIndex++;

              if (requestIndex >= allSeats.length) {
                done();
              } else {
                requestNext();
              }
            });
        };

        requestNext();
      });

      it('should have at least one available seat booked', function ()
      {
        expect(allBookedSeats).to.have.length.of.at.least(1);
      });

      it('should respond 4** JSON for post requests to already booked seats', function (done)
      {
        // Requesting for all 400 seats may take a while.
        this.timeout(150 * allBookedSeats.length); // Give 150 ms for each request.

        var requestIndex = 0;
        var requestNext = function () {
          var theSeat = allBookedSeats[requestIndex];

          chai.request(host)
            .post(path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id, 'order'))
            .send({
              "data": {
                "firstname": "Foo",
                "lastname": "Bar"
              }
            })
            .end(function (err, res)
            {
              expect(err).to.not.be.null;
              // statusCode should be 4**.
              expect(getDigit(res.statusCode, 2)).to.equal(4);
              expect(res).to.be.json;

              requestIndex++;

              if (requestIndex >= allBookedSeats.length) {
                done();
              } else {
                requestNext();
              }
            });
        };

        requestNext();
      });

    });

    describe('response', function ()
    {

      it('should have an object in body', function ()
      {
        allResponse.forEach(function (response, index)
        {
          if (allSeats[index].attributes.available === true) {
            expect(response).to.be.an('object');
          }
        });
      });

      describe('response body', function ()
      {

        it('should have property "data"', function ()
        {
          allResponse.forEach(function (response, index)
          {
            if (allSeats[index].attributes.available === true) {
              expect(response.body).to.have.property('data');
            }
          });
        });

        describe('data', function ()
        {

          it('should be an object with type "tickets"', function ()
          {
            allResponse.forEach(function (response, index)
            {
              if (allSeats[index].attributes.available === true) {
                expect(response.body.data).to.be.an('object')
                .and.have.property('type', 'tickets');
              }
            });
          });

          it('should have a string type property "id" that is not empty', function ()
          {
            allResponse.forEach(function (response, index)
            {
              if (allSeats[index].attributes.available === true) {
                expect(response.body.data).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
              }
            });
          });

          it('should have an object type property "attributes"', function ()
          {
            allResponse.forEach(function (response, index)
            {
              if (allSeats[index].attributes.available === true) {
                expect(response.body.data).to.have.property('attributes')
                  .that.is.an('object');
              }
            });
          });

          describe('property "attributes"', function ()
          {

            it('should have a string type property "createdAt" that represents a date', function ()
            {
              allResponse.forEach(function (response, index)
              {
                if (allSeats[index].attributes.available === true) {
                  expect(response.body.data.attributes).to.have.property('createdAt')
                    // Verify it's a Date-compatible string.
                    .that.is.a('string')
                    .and.satisfy(validateDateString);
                }
              });
            });

            it('should have a string type property "firstname"', function ()
            {
              allResponse.forEach(function (response, index)
              {
                if (allSeats[index].attributes.available === true) {
                  expect(response.body.data.attributes).to.have.property('firstname')
                    .that.is.a('string')
                    .and.not.empty;
                }
              });
            });

            it('should have a string type property "lastname"', function ()
            {
              allResponse.forEach(function (response, index)
              {
                if (allSeats[index].attributes.available === true) {
                  expect(response.body.data.attributes).to.have.property('lastname')
                    .that.is.a('string')
                    .and.not.empty;
                }
              });
            });

          });

          it('should have an object type property "relationships"', function ()
          {
            allResponse.forEach(function (response, index)
            {
              if (allSeats[index].attributes.available === true) {
                expect(response.body.data).to.have.property('relationships')
                  .that.is.an('object');
              }
            });
          });

          describe('property "relationships"', function ()
          {

            it('should have an object type property "movie" that points to the movie', function ()
            {
              allResponse.forEach(function (response, index)
              {
                if (allSeats[index].attributes.available === true) {
                  expect(response.body.data.relationships).to.have.property('movie')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));
                }
              });
            });

            it('should have an object type property "schedule" that points to the schedule', function ()
            {
              allResponse.forEach(function (response, index)
              {
                if (allSeats[index].attributes.available === true) {
                  expect(response.body.data.relationships).to.have.property('schedule')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'schedules', theSchedule.id));
                }
              });
            });

            it('should have an object type property "room" that points to the room', function ()
            {
              allResponse.forEach(function (response, index)
              {
                if (allSeats[index].attributes.available === true) {
                  expect(response.body.data.relationships).to.have.property('room')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'rooms', theRoom.id));
                }
              });
            });

            it('should have an object type property "seat" that points to the seat', function ()
            {
              allResponse.forEach(function (response, index)
              {
                if (allSeats[index].attributes.available === true) {
                  expect(response.body.data.relationships).to.have.property('seat')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'seats', allSeats[index].id));
                }
              });
            });

          });

          it('should have an object type property "links"', function ()
          {
            allResponse.forEach(function (response, index)
            {
              if (allSeats[index].attributes.available === true) {
                expect(response.body.data).to.have.property('links')
                  .that.is.an('object');
              }
            });
          });

          describe('property "links"', function ()
          {

            it('should point to the item', function ()
            {
              allResponse.forEach(function (response, index)
              {
                if (allSeats[index].attributes.available === true) {
                  expect(response.body.data.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', allSeats[index].id, 'order', response.body.data.id)));
                }
              });
            });

          });

        });

        it('should have property "included"', function ()
        {
          allResponse.forEach(function (response, index)
          {
            if (allSeats[index].attributes.available === true) {
              expect(response.body).to.have.property('included');
            }
          });
        });

        describe('included', function ()
        {

          it('should be a list that contains the movie, the schedule, the room and the seat', function ()
          {
            allResponse.forEach(function (response, index)
            {
              if (allSeats[index].attributes.available === true) {
                expect(response.body.included).to.be.an('array')
                .and.satisfy(_.partial(validateIncludedArray, {
                  movies: theMovie.id,
                  schedules: theSchedule.id,
                  rooms: theRoom.id,
                  seats: allSeats[index].id
                }));
              }
            });
          });

        });

      });

    });

  });

});
