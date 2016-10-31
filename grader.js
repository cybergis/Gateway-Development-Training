// Depend on mocha, chai, chai-http

var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

var host = 'http://localhost:3000';
var endpoint = '/rest/v1';

describe('App', function() {
	it('should be online', function (done) {
		chai.request(host)
				.get('/')
				.end(function (err, res) {
					expect(err).to.equal(null);
					done();
				});
	});
});
