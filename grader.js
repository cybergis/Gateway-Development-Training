// Depend on mocha, chai, chai-http

var url = require('url');
var path = require('path');
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

function validateSelfLink (obj) {
  expect(obj).to.be.an('object')
    .and.have.property('self');
  expect(obj.self).to.be.a('string')
    .and.not.empty;
  return true;
}

function validateRelationObject (obj) {
  expect(obj).to.be.an('object');
  Object.keys(obj).forEach(function (propName) {
    expect(obj[propName]).to.be.an('object')
      .and.have.property('links');
    expect(obj[propName].links).to.satisfy(validateSelfLink);
  });
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

  var savedMovies = [];

	describe('/movies', function() {
	  var selfPath = path.join(endpoint, 'movies');

    it('should list all scheduled movies', function (done) {
      chai.request(host)
        .get(selfPath)
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');

          // Check links?
          var links = res.body.links;
          expect(links).to.satisfy(validateSelfLink);

          var data = res.body.data;
          // Check data.
          expect(data).to.be.an('array')
            .and.have.length.of.at.least(1);

          data.forEach(function (movie) {
            expect(movie).to.be.an('object')
              .and.have.property('type', 'movies');

            expect(movie).to.have.property('id')
              .that.is.a('string').and.not.empty;

            // Check data item attributes.
            expect(movie).to.have.property('attributes')
              .that.is.an('object');

            // Every movie has to have a non-empty title.
            expect(movie.attributes).to.have.property('title')
              .that.is.a('string').and.not.empty;

            // Every movie has to have a date for the most recent schedule.
            expect(movie.attributes).to.have.property('mostRecentScheduleAt')
              // Verify it's a Date-compatible string.
              .that.is.a('string').and.equal((new Date(movie.attributes.mostRecentScheduleAt)).toJSON());

            // Check data item relationships.
            expect(movie).to.have.property('relationships')
              .that.is.an('object')
              .and.have.property('schedules')
                .that.is.an('object')
                .and.have.property('links')
                  .that.satisfy(validateSelfLink);

            // Check data item link.
            expect(movie).to.have.property('links')
              .that.satisfy(validateSelfLink);

            savedMovies.push({
              title: movie.attributes.title,
              id: movie.id,
              scheduleLink: movie.relationships.schedules.links.self
            });
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
});
