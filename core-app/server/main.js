import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
export const Movies = new Mongo.Collection('movies');
export const Rooms = new Mongo.Collection('rooms');

Meteor.startup(() => {
	var seats = [];
	for(var i = 0; i < 400; i++)
		seats.push({seatid: i, available: true});

	movieid = "1000";
  //Write some dummy data into the server
  var data = [{"_id":movieid, name: "Star Wars", lastPlay: new Date("2016-11-10T00:00:00"), plays : [
{start: new Date("2016-11-02T00:00:00"), duration: "2:50h", "scheduleId": 1, rooms: [{room: 1}]},
{start: new Date("2016-11-02T03:00:00"), duration: "2:50h", "scheduleId": 2,rooms: [{room: 1}]},
{start: new Date("2016-11-02T06:00:00"), duration: "2:50h", "scheduleId": 3,rooms: [{room: 1}]},
{start: new Date("2016-11-02T09:00:00"), duration: "2:50h", "scheduleId": 4,rooms: [{room: 1}]},
{start: new Date("2016-11-02T12:00:00"), duration: "2:50h", "scheduleId": 5,rooms: [{room: 1}]},
{start: new Date("2016-11-02T15:00:00"), duration: "2:50h", "scheduleId": 6,rooms: [{room: 1}]},
{start: new Date("2016-11-02T18:00:00"), duration: "2:50h", "scheduleId": 7,rooms: [{room: 1}]},
{start: new Date("2016-11-02T19:00:00"), duration: "2:50h", "scheduleId": 8,rooms: [{room: 1}]}]}];
  	for (var i in data){
		//Movies.insert(data[i]);
  	}

	data = data[0];
	for (var i in data.plays){
		for (var j in data.plays[i].rooms){
			//Rooms.insert({"movieId": movieid, "scheduleId": data.plays[i].scheduleId, "roomId": data.plays[i].rooms[j].room, "seats": seats});
	}}
});

Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

var bodyParser = Meteor.npmRequire('body-parser'); 
Picker.middleware(bodyParser.urlencoded({ extended: false }));
Picker.middleware(bodyParser.json());

var get = Picker.filter(function(req, res) {
  return req.method == "GET";
});

var fake_result = {answer: "nonsense"};

get.route('/rest/v1/movies', function(params, req, res, next) {
	var start_time = new Date(new Date().toISOString());
	var end_time = new Date(new Date().addDays(30).toISOString());
	var json  = [];
	var result = Movies.find({'lastPlay': {$gte:start_time, $lte:end_time} }, {fields: {"name": 1, "lastPlay": 1}});
	result.forEach(record => {
		json.push(record);
	});

	//Sorting has not been implemented
	res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify(json));
});

get.route('/rest/v1/movies/:movieid/schedules', function(params, req, res, next) {
	var json  = [];
	var start_time = new Date(new Date().toISOString());
	var end_time = new Date(new Date().addDays(30).toISOString());
	var result = Movies.find({/*'_id': params.movieid , */'plays': {$elemMatch: {'start': {$gte:start_time, $lte:end_time}}}}, {fields: {"plays": 1}});
	result.forEach(record => {
		json.push(record);
	});

	//Sorting has not been implemented
	res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify(json));
});

get.route('/rest/v1/movies/:movieid/schedules/:scheduleid/rooms', function(params, req, res, next) {
	var json  = [];
	var result = Movies.find({'_id': params.movieid},{fields: {'plays': {$elemMatch:{'scheduleId':  Number(params.scheduleid)}}}});//, {fields: {"plays": 1}});	
	//var result = Movies.find({/*'_id': params.movieid ,*/ 'plays': {$elemMatch: {'scheduleId': Number(params.scheduleid)}}}, {fields: {"plays": 1}});
	result.forEach(record => {
		json.push(record);
	});

	//Sorting has not been implemented
	res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify(json));
});

get.route('/rest/v1/movies/:movieid/schedules/:scheduleid/rooms/:roomid/seats', function(params, req, res, next) {
	var json  = [];
	//var result = Rooms.find({'movieId': params.movieid,},{fields: {'plays': {$elemMatch:{'scheduleId':  Number(params.scheduleid)}}}});	
	var result = Rooms.find({'movieId': params.movieid, 'scheduleId': Number(params.scheduleid), 'roomId': Number(params.roomid)});
	result.forEach(record => {
		json.push(record);
	});

	//Sorting has not been implemented
	res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify(json));
});

get.route('/rest/v1/movies/:movieid/schedules/:scheduleid/rooms/:roomid/seats/:seatid', function(params, req, res, next) {
	var json  = [];
	//var result = Rooms.find({'movieId': params.movieid,},{fields: {'plays': {$elemMatch:{'scheduleId':  Number(params.scheduleid)}}}});	
	var result = Rooms.find({'movieId': params.movieid, 'scheduleId': Number(params.scheduleid), 'roomId': Number(params.roomid)}, {'fields': {'seats': {$elemMatch: {'seatid': Number(params.seatid)}}}});
	result.forEach(record => {
		json.push(record);
	});

	//Sorting has not been implemented
	res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify(json));
});


var post = Picker.filter(function(req, res) {
  return req.method == "POST";
});

post.route('/rest/v1/movies/:movieid/schedules/:scheduleid/rooms/:roomid/seats/:seatid', function(params, req, res, next) {
	res.setHeader('Content-Type','application/json');

	var code = Rooms.update(
   		{'movieId': params.movieid, 'scheduleId': Number(params.scheduleid), 'roomId': Number(params.roomid), 'seats.seatid': Number(params.seatid) },
   		{ $set: { 'seats.$.available': false } }
	);
	if (code == 0) res.end("Error in Adding");
	else res.end("Done!");
});


