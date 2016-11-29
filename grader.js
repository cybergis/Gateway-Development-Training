// Depend on mocha, lodash, chai, chai-http

var url = require('url');
var path = require('path');
var _ = require('lodash');
var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');

var baseBranchName = 'stage-3.1';

if (typeof process.env.TRAVIS_BRANCH === 'string' && process.env.TRAVIS_BRANCH !== "") {
  // Travis.
  if (typeof process.env.TRAVIS_PULL_REQUEST_BRANCH === 'string' && process.env.TRAVIS_PULL_REQUEST_BRANCH !== "") {
    // PR
    if (process.env.TRAVIS_PULL_REQUEST_BRANCH.indexOf(baseBranchName + '__') === 0) {
      // This PR is from a branch named `baseBranchName__*`. Run tests normally.
    } else {
      // Unexpected branch name. Fail.
      exit 1;
    }
  } else {
    // Push
    if (process.env.TRAVIS_BRANCH === baseBranchName) {
      // This is the base branch. Do not run tests for base branch (since it will always fail).
      exit 0;
    } else {
      // This is not the base branch. Run tests normally.
    }
  }
} else {
  // Not Travis. Run tests normally.
}

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

function getAllItems (done)
{
  chai.request(host)
    .get(path.join(endpoint, 'items'))
    .end(function (err, res)
    {
      try
      {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        expect(res.body).to.be.an('object')
          .that.has.property('data')
            .that.is.an('array');

        done(null, res.body.data);
      }
      catch (e)
      {
        done(e, null);
      }
    });
}

function getItem (itemId, done)
{
  chai.request(host)
    .get(path.join(endpoint, 'items', itemId))
    .end(function (err, res)
    {
      try
      {
        expect(err).to.be.null;
        // statusCode should be 2**.
        expect(getDigit(res.statusCode, 2)).to.equal(2);
        expect(res).to.be.json;

        expect(res.body).to.be.an('object')
        .and.has.property('data')
          .that.is.an('object')
          .and.has.property('id')
            .that.equal(itemId);

        done(null, res.body.data);
      }
      catch (e)
      {
        done(e, null);
      }
    });
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

  describe('GETing /items', function ()
  {
    var allItems;

    before(function (done)
    {
      getAllItems(function (err, items)
      {
        expect(err).to.be.null;

        allItems = items;

        done();
      });
    });

    describe('response', function ()
    {

      it('should have at least one item', function ()
      {
        expect(allItems).to.have.length.of.at.least(1);

        itemCountBeforeAdd = allItems.length;
      });

      describe('every item', function ()
      {

        before(function() {
          expect(allItems).to.have.length.of.at.least(1);
        });

        it('should be an object with type "items"', function ()
        {
          allItems.forEach(function (item)
          {
            expect(item).to.be.an('object')
            .and.have.property('type', 'items');
          });
        });

        it('should have a string type property "id" that is not empty', function ()
        {
          allItems.forEach(function (item)
          {
            expect(item).to.have.property('id')
              .that.is.a('string')
              .and.not.empty;
          });
        });

        it('should have an object type property "attributes"', function ()
        {
          allItems.forEach(function (item)
          {
            expect(item).to.have.property('attributes')
              .that.is.an('object');
          });
        });

        describe('property "attributes"', function ()
        {

          it('should have a string type property "createdAt" that represents a date', function ()
          {
            allItems.forEach(function (item)
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

        before(function() {
          expect(allItems).to.have.length.of.at.least(1);
        });

        it('should be accessible', function (done)
        {
          // Requesting for all 400 seats may take a while.
          this.timeout(100 * allItems.length); // Give 100 ms for each request.

          var requestIndex = 0;
          var requestNext = function () {
            var theItem = allItems[requestIndex];

            getItem(theItem.id, function (err, item)
            {
              expect(err).to.be.null;

              requestIndex++;

              if (requestIndex >= allItems.length)
              {
                done();
              }
              else
              {
                requestNext();
              }
            });
          };

          requestNext();
        });

      });

    });

  });

  describe('POSTing /items', function ()
  {
    var selfPath, newSecrets, newItems;

    before(function ()
    {
      selfPath = path.join(endpoint, 'items');

      // Prepare new items.
      newSecrets = [];
      var newItemCount = Math.floor(5 + Math.random() * 5);
      for (var i = 0, n = newItemCount; i < n; ++i) {
        newSecrets.push(String(1 + Math.random()));
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

            if (requestIndex >= newSecrets.length)
            {
              done();
            }
            else
            {
              requestNext();
            }
          });
      };

      requestNext();
    });

    it('list should contain new items', function (done)
    {
      getAllItems(function (err, items)
      {
        expect(err).to.be.null;

        expect(items.length).to.equal(itemCountBeforeAdd + newItems.length);

        expect(newItems.every(function (item1) {
          return items.some(function (item2) {
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

        getItem(theItem.id, function (err, item)
        {
          expect(err).to.be.null;

          requestIndex++;

          if (requestIndex >= newItems.length)
          {
            done();
          }
          else
          {
            requestNext();
          }
        })
      };

      requestNext();
    });

  });

  describe('PUTing /items/SomeID', function ()
  {
    var allItems;

    before(function (done)
    {
      getAllItems(function (err, items)
      {
        expect(err).to.be.null;

        allItems = items;

        done();
      });
    });

    it('should update the item', function (done)
    {
      // Requesting for all 400 seats may take a while.
      this.timeout(100 * allItems.length); // Give 100 ms for each request.

      var requestIndex = 0;
      var requestNext = function () {
        var theItem = allItems[requestIndex],
            theSecret = String(2 + Math.random());

        chai.request(host)
          .put(path.join(endpoint, 'items', theItem.id))
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
              .that.is.a('string')
              .and.equal(theItem.id);

            getItem(theItem.id, function (err, item)
            {
              expect(err).to.be.null;

              expect(item).to.have.property('attributes')
                .that.is.an('object')
                .and.have.property('secret')
                  .that.equal(theSecret);

              requestIndex++;

              if (requestIndex >= allItems.length)
              {
                done();
              }
              else
              {
                requestNext();
              }
            });
          });
      };

      requestNext();
    });

  });

  describe('DELETEing /items/SomeID', function ()
  {
    var allItems;

    before(function (done)
    {
      getAllItems(function (err, items)
      {
        expect(err).to.be.null;

        allItems = items;

        done();
      });
    });

    it('should delete the item', function (done)
    {
      // Requesting for all 400 seats may take a while.
      this.timeout(100 * allItems.length); // Give 100 ms for each request.

      var requestIndex = 0;
      var requestNext = function () {
        var theItem = allItems[requestIndex];

        chai.request(host)
          .delete(path.join(endpoint, 'items', theItem.id))
          .end(function (err, res)
          {
            expect(err).to.be.null;
            // statusCode should be 2**.
            expect(getDigit(res.statusCode, 2)).to.equal(2);
            expect(res).to.be.json;

            expect(res.body.data).to.have.property('id')
              .that.is.a('string')
              .and.equal(theItem.id);

            getItem(theItem.id, function (err, item)
            {
              expect(err).to.be.not.null;

              requestIndex++;

              if (requestIndex >= allItems.length)
              {
                done();
              }
              else
              {
                requestNext();
              }
            });
          });
      };

      requestNext();
    });
  });

});

