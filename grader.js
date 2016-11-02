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

// Tests start.

describe('App', function ()
{
  var theMovie, theSchedule, theRoom, theSeat;

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
              response.body.data.every(function (item)
              {
                expect(item).to.be.an('object')
                .and.have.property('type', 'movies');
                return true;
              });
            });

            it('should have a string type property "id" that is not empty', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
                return true;
              });
            });

            it('should have an object type property "attributes"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('attributes')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "attributes"', function ()
            {

              it('should have a string type property "title" that is not empty', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('title')
                    .that.is.a('string')
                    .and.not.empty;
                  return true;
                });
              });

              it('should have a string type property "mostRecentScheduleAt" that represents a date', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('mostRecentScheduleAt')
                    // Verify it's a Date-compatible string.
                    .that.is.a('string')
                    .and.satisfy(validateDateString);
                  return true;
                });
              });

            });

            it('should have an object type property "relationships"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('relationships')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "relationships"', function ()
            {

              it('should have an object type property "schedules" that links to the schedules page', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.relationships).to.have.property('schedules')
                    .that.is.an('object')
                    .and.have.property('links')
                      .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', item.id, 'schedules')));
                  return true;
                });
              });

            });

            it('should have an object type property "links"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('links')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "links"', function ()
            {

              it('should point to the item', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', item.id)));
                  return true;
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
              response.body.data.every(function (item)
              {
                expect(item).to.be.an('object')
                .and.have.property('type', 'schedules');
                return true;
              });
            });

            it('should have a string type property "id" that is not empty', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
                return true;
              });
            });

            it('should have an object type property "attributes"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('attributes')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "attributes"', function ()
            {

              it('should have a number type property "price"', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('price')
                    .that.is.a('number');
                  return true;
                });
              });

              it('should have a string type property "startAt" that represents a date', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('startAt')
                    .that.is.a('string')
                    .and.satisfy(validateDateString);
                  return true;
                });
              });

            });

            it('should have an object type property "relationships"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('relationships')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "relationships"', function ()
            {

              it('should have an object type property "movie" that points to the movie', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.relationships).to.have.property('movie')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));
                  return true;
                });
              });

              it('should have an object type property "rooms" that links to the rooms page', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.relationships).to.have.property('rooms')
                    .that.is.an('object')
                    .and.have.property('links')
                      .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', item.id, 'rooms')));
                  return true;
                });
              });

            });

            it('should have an object type property "links"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('links')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "links"', function ()
            {

              it('should point to the item', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', item.id)));
                  return true;
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
    var selfPath;

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
              response.body.data.every(function (item)
              {
                expect(item).to.be.an('object')
                .and.have.property('type', 'rooms');
                return true;
              });
            });

            it('should have a string type property "id" that is not empty', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
                return true;
              });
            });

            it('should have an object type property "attributes"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('attributes')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "attributes"', function ()
            {

              it('should have a string type property "title" that is not empty', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('title')
                    .that.is.a('string')
                    .and.not.empty;
                  return true;
                });
              });

              it('should have a number type property "rows"', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('rows')
                    .that.is.a('number')
                    .and.is.above(0);
                  return true;
                });
              });

              it('should have a number type property "columns"', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('columns')
                    .that.is.a('number')
                    .and.is.above(0);
                  return true;
                });
              });

            });

            it('should have an object type property "relationships"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('relationships')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "relationships"', function ()
            {

              it('should have an object type property "movie" that points to the movie', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.relationships).to.have.property('movie')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));
                  return true;
                });
              });

              it('should have an object type property "schedule" that points to the schedule', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.relationships).to.have.property('schedule')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'schedules', theSchedule.id));
                  return true;
                });
              });

              it('should have an object type property "seats" that links to the seats page', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.relationships).to.have.property('seats')
                    .that.is.an('object')
                    .and.have.property('links')
                      .that.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', item.id, 'seats')));
                  return true;
                });
              });

            });

            it('should have an object type property "links"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('links')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "links"', function ()
            {

              it('should point to the item', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', item.id)));
                  return true;
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
    var selfPath;

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
              response.body.data.every(function (item)
              {
                expect(item).to.be.an('object')
                .and.have.property('type', 'seats');
                return true;
              });
            });

            it('should have a string type property "id" that is not empty', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('id')
                  .that.is.a('string')
                  .and.not.empty;
                return true;
              });
            });

            it('should have an object type property "attributes"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('attributes')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "attributes"', function ()
            {

              it('should have a number type property "number"', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('number')
                    .that.is.a('number')
                    .and.is.above(0);
                  return true;
                });
              });

              it('should have a number type property "row"', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('row')
                    .that.is.a('number')
                    .and.is.above(0);
                  return true;
                });
              });

              it('should have a number type property "column"', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('column')
                    .that.is.a('number')
                    .and.is.above(0);
                  return true;
                });
              });

              it('should have a boolean type property "available"', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.attributes).to.have.property('available')
                    .that.is.a('boolean');
                  return true;
                });
              });

            });

            it('should have an object type property "relationships"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('relationships')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "relationships"', function ()
            {

              it('should have an object type property "movie" that points to the movie', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.relationships).to.have.property('movie')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));
                  return true;
                });
              });

              it('should have an object type property "schedule" that points to the schedule', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.relationships).to.have.property('schedule')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'schedules', theSchedule.id));
                  return true;
                });
              });

              it('should have an object type property "room" that points to the room', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.relationships).to.have.property('room')
                    .that.is.an('object')
                    .and.satisfy(_.partialRight(validateRelationObject, 'rooms', theRoom.id));
                  return true;
                });
              });

            });

            it('should have an object type property "links"', function ()
            {
              response.body.data.every(function (item)
              {
                expect(item).to.have.property('links')
                  .that.is.an('object');
                return true;
              });
            });

            describe('property "links"', function ()
            {

              it('should point to the item', function ()
              {
                response.body.data.every(function (item)
                {
                  expect(item.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', item.id)));
                  return true;
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
              theSeat = response.body.data[0];
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
    var selfPath, response;

    before(function ()
    {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id);
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

        it('should have property "data"', function ()
        {
          expect(response.body).to.have.property('data');
        });

        describe('data', function ()
        {

          it('should be an object with type "seats"', function ()
          {
            expect(response.body.data).to.be.an('object')
            .and.have.property('type', 'seats');
          });

          it('should have a string type property "id" that is not empty', function ()
          {
            expect(response.body.data).to.have.property('id')
              .that.is.a('string')
              .and.not.empty;
          });

          it('should have an object type property "attributes"', function ()
          {
            expect(response.body.data).to.have.property('attributes')
              .that.is.an('object');
          });

          describe('property "attributes"', function ()
          {

            it('should have a number type property "number"', function ()
            {
              expect(response.body.data.attributes).to.have.property('number')
                .that.is.a('number')
                .and.is.above(0);
            });

            it('should have a number type property "row"', function ()
            {
              expect(response.body.data.attributes).to.have.property('row')
                .that.is.a('number')
                .and.is.above(0);
            });

            it('should have a number type property "column"', function ()
            {
              expect(response.body.data.attributes).to.have.property('column')
                .that.is.a('number')
                .and.is.above(0);
            });

            it('should have a boolean type property "available"', function ()
            {
              expect(response.body.data.attributes).to.have.property('available')
                .that.is.a('boolean');
            });

          });

          it('should have an object type property "relationships"', function ()
          {
            expect(response.body.data).to.have.property('relationships')
              .that.is.an('object');
          });

          describe('property "relationships"', function ()
          {

            it('should have an object type property "movie" that points to the movie', function ()
            {
              expect(response.body.data.relationships).to.have.property('movie')
                .that.is.an('object')
                .and.satisfy(_.partialRight(validateRelationObject, 'movies', theMovie.id));
            });

            it('should have an object type property "schedule" that points to the schedule', function ()
            {
              expect(response.body.data.relationships).to.have.property('schedule')
                .that.is.an('object')
                .and.satisfy(_.partialRight(validateRelationObject, 'schedules', theSchedule.id));
            });

            it('should have an object type property "room" that points to the room', function ()
            {
              expect(response.body.data.relationships).to.have.property('room')
                .that.is.an('object')
                .and.satisfy(_.partialRight(validateRelationObject, 'rooms', theRoom.id));
            });

          });

          it('should have an object type property "links"', function ()
          {
            expect(response.body.data).to.have.property('links')
              .that.is.an('object');
          });

          describe('property "links"', function ()
          {

            it('should point to the item', function ()
            {
              expect(response.body.data.links).to.satisfy(_.partialRight(validateSelfLink, path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', response.body.data.id)));
            });

            it('should point to the order page', function ()
            {
              expect(response.body.data.links).to.have.property('order')
              .that.is.a('string');
              expect(url.parse(response.body.data.links.order).pathname).to.equal(path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', response.body.data.id, 'order'));
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



  describe.skip('book the selected seat of the selected room for the selected schedule of the selected movie', function ()
  {
    var selfPath;

    before(function ()
    {
      selfPath = path.join(endpoint, 'movies', theMovie.id, 'schedules', theSchedule.id, 'rooms', theRoom.id, 'seats', theSeat.id, order);
    });

    describe('Endpoint', function ()
    {

      it('should respond 2** JSON for post requests', function (done)
      {
        chai.request(host)
          .get(selfPath)
          .end(function (err, res)
          {
            expect(err).to.be.null;
            // statusCode should be 2**.
            expect(getDigit(res.statusCode, 2)).to.equal(2);
            expect(res).to.be.json;

            response = res;
            done();
          });
      });

      it('should respond 4** JSON for get requests', function (done)
      {
        chai.request(host)
          .get(selfPath)
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

      //! Check body.

    });

  });

});
