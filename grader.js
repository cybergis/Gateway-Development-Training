// Depend on mocha, chai, chai-http

var url = require('url');
var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

var host = 'http://localhost:3000';
var endpoint = '/rest/v1';

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

	describe('Test Killer', function() {

    it('should always fail', function () {
      expect(true).to.be.false;
    });

	});
});
