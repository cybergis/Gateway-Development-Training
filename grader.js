// Depend on mocha, lodash, chai, chai-http

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

  var itemCountBeforeAdd = 0;

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

  describe('list all items', function ()
  {
    var selfPath, response;

    before(function ()
    {
      selfPath = path.join(endpoint, 'items');
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

          it('should be a list with at least one item', function ()
          {
            expect(response.body.data).to.be.an('array')
            .and.have.length.of.at.least(1);

            itemCountBeforeAdd = response.body.data.length;
          });

          describe('every item', function ()
          {

            before(function() {
              expect(response.body.data).to.be.an('array')
              .and.have.length.of.at.least(1);
            });

            it('should be an object with type "items"', function ()
            {
              response.body.data.forEach(function (item)
              {
                expect(item).to.be.an('object')
                .and.have.property('type', 'items');
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

              it('should have a string type property "createdAt" that represents a date', function ()
              {
                response.body.data.forEach(function (item)
                {
                  expect(item.attributes).to.have.property('createdAt')
                    // Verify it's a Date-compatible string.
                    .that.is.a('string')
                    .and.satisfy(validateDateString);
                });
              });

            });

          });

          describe('all items', function ()
          {

            var allItems;

            before(function() {
              expect(response.body.data).to.be.an('array')
              .and.have.length.of.at.least(1);

              allItems = response.body.data;
            });

            it('should be accessible', function (done)
            {
              // Requesting for all 400 seats may take a while.
              this.timeout(100 * allItems.length); // Give 100 ms for each request.

              var requestIndex = 0;
              var requestNext = function () {
                var theItem = allItems[requestIndex];

                chai.request(host)
                  .get(path.join(endpoint, 'items', theItem.id))
                  .end(function (err, res)
                  {
                    expect(err).to.be.null;
                    // statusCode should be 2**.
                    expect(getDigit(res.statusCode, 2)).to.equal(2);
                    expect(res).to.be.json;

                    expect(res.body.data.id).to.equal(theItem.id);

                    requestIndex++;

                    if (requestIndex >= allItems.length) {
                      done();
                    } else {
                      requestNext();
                    }
                  });
              };

              requestNext();
            });

          });

        });

      });

    });

  });

  describe('Posting to /items', function ()
  {
    var selfPath, newSecrets, newItems;

    before(function ()
    {
      selfPath = path.join(endpoint, 'items');

      newSecrets = [];
      var newItemCount = Math.floor(5 + Math.random() * 5);
      for (var i = 0, n = newItemCount; i < n; ++i) {
        newSecrets.push(String(Math.random()));
      }

      newItems = [];
    });

    it('should successfully add new items', function (done)
    {
      // Requesting for all 400 seats may take a while.
      this.timeout(100 * newSecrets.length); // Give 100 ms for each request.

      var requestIndex = 0;
      var requestNext = function () {
        var theSecret = newSecrets[requestIndex];

        chai.request(host)
          .post(selfPath)
          .send({
            "data": {
              "secret": theSecret
            }
          })
          .end(function (err, res)
          {
            expect(err).to.be.null;
            // statusCode should be 2**.
            expect(getDigit(res.statusCode, 2)).to.equal(2);
            expect(res).to.be.json;

            expect(res.body.data).to.have.property('attributes')
              .that.is.an('object')
              .and.have.property('secret')
                .that.equal(theSecret);

            expect(res.body.data).to.have.property('id')
              .that.is.a('string');

            newItems.push(res.body.data);

            requestIndex++;

            if (requestIndex >= newSecrets.length) {
              done();
            } else {
              requestNext();
            }
          });
      };

      requestNext();
    });

    it('list should contain new items', function (done)
    {
      chai.request(host)
        .get(selfPath)
        .end(function (err, res)
        {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body.data).to.be.an('array')
          .and.have.length.of.at.least(1);

          expect(res.body.data.length).to.equal(itemCountBeforeAdd + newItems.length);

          expect(newItems.every(function (item1) {
            return res.body.data.some(function (item2) {
              return item1.id === item2.id;
            });
          })).to.be.true;

          done();
        });
    });

    it('new items should be accessible', function (done)
    {
      // Requesting for all 400 seats may take a while.
      this.timeout(100 * newItems.length); // Give 100 ms for each request.

      var requestIndex = 0;
      var requestNext = function () {
        var theItem = newItems[requestIndex];

        chai.request(host)
          .get(path.join(endpoint, 'items', theItem.id))
          .end(function (err, res)
          {
            expect(err).to.be.null;
            // statusCode should be 2**.
            expect(getDigit(res.statusCode, 2)).to.equal(2);
            expect(res).to.be.json;

            expect(res.body.data.id).to.equal(theItem.id);

            requestIndex++;

            if (requestIndex >= newItems.length) {
              done();
            } else {
              requestNext();
            }
          });
      };

      requestNext();
    });

  });

  describe.skip('Putting to /items/SomeID', function ()
  {

  });

  describe.skip('Deleting /items/SomeID', function ()
  {

  });

});

