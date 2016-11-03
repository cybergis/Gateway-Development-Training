import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

Plays = new Mongo.Collection('plays');
Tickets = new Mongo.Collection('tickets');

Date.prototype.addDays = function(d)
{
    this.setDate(this.getDate() + d);
    return this;
}

Date.prototype.addHours= function(h){
    this.setHours(this.getHours() + h);
    return this;
}


Meteor.startup(function () {
    // insert fixture data
    Plays.remove({});
    Tickets.remove({});

    if (!Plays.findOne()) {
        var seats = [];
        var plays = [];
        for (var i=0; i<10; i++) {
            Plays.insert({
                movie_id: 0,
                title: "Matrix",
                schedule_id: i,
                time: new Date("2016-11-05T00:00:00").addHours(3*i),
                price: 15,
                room_id: 0,
                availNum: 10,
                rows: 20,
                columns: 20,
                roomName: 'Room 1'

            });
        }
    }

    if (!Tickets.findOne()) {
        for (var i=0; i<10; i++) {
            for (var j=0; j<10; j++) {
                Tickets.insert({
                    movie_id:0,
                    movie_title: "MOVIE TITLE",
                    ticket_id: i*10+j,
                    seat_id:j,
                    row:Math.floor(j/20)+1,
                    column:j%20+1,
                    available:true,
                    schedule_id:i,
                    time: new Date("2020-01-01T00:00:00").addHours(3*i),
                    room_id: 0,
                    firstName: '',
                    lastName: '',
                    roomName: 'Room X'
                });
            }
        }
    }

})

if (Meteor.isServer) {

    var Api = new Restivus({
        apiPath: 'rest/',
        useDefaultAuth: true,
        prettyJson: true,
        version: 'v1'
    });

    //List all scheduled movies
    //GET /rest/v1/movies
    Api.addRoute('movies/', {
        get: function () {
            var now_time = new Date(new Date().toISOString());
            var end_time = new Date(new Date().addDays(30).toISOString());
            // need to format the response string as HATEOAS
            return {
                'statusCode': 200,
                'body': Plays.find({time: {$gte:now_time, $lte:end_time}},{fields: {movie_id: 1, title: 1, time: 1, _id: 0}, sort: { time: 1 }})
                    .fetch()
            };
        }
    });

    //List all schedules of the selected movie
    //GET /rest/v1/movies/<someMovieId>/schedules
    Api.addRoute('movies/:id/schedules', {
        get: function () {
            var movie_id = Number(this.urlParams.id);
            // need to format the response string as HATEOAS
            return {
                'statusCode': 200,
                'body': Plays.find({movie_id:movie_id},{fields: {title: 1, time: 1, schedule_id: 1, _id:0}, sort: { time: 1 }})
                    .fetch()
            };
        }
    });

    //List all rooms of the selected schedule of the selected movie
    //GET /rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms
    Api.addRoute('movies/:movieId/schedules/:scheduleId/rooms', {
        get: function () {
            var movie_id = Number(this.urlParams.movieId);
            var schedule_id = Number(this.urlParams.scheduleId);
            var res = Plays.find({movie_id: movie_id, schedule_id: schedule_id},{fields: {title: 1, room_id: 1, room_title: 1, time: 1, availNum: 1, _id:0}, sort: { availNum: -1 }})
                if (res.count()==0) {
                    return {
                        'statusCode': 400,
                        'body': 'Not found'
                    };
                }
                else{
                    // need to format the response string as HATEOAS
                    return {
                        'statusCode': 200,
                        'body': res.fetch()
                    };
                }
        }
    });

    //List all seats of the selected room for the selected schedule of the selected movie
    //GET /rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats[?sort&filter]
    Api.addRoute('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats', {
        get: function () {
            var movie_id = Number(this.urlParams.movieId);
            var schedule_id = Number(this.urlParams.scheduleId);
            var room_id = Number(this.urlParams.roomId);
            var query = this.queryParams;
            var sort = query.sort;
            var filter = query.filter;
            if (filter) {
                var row_start = parseInt(filter.split(";")[0].split(":")[1]);
                var row_end = parseInt(filter.split(";")[1].split(":")[1]);
            }else{
                var row_start = 1;
                var row_end = 20;
            }

            if (sort=='available') {
                var res = Tickets.find({movie_id: movie_id, schedule_id: schedule_id, room_id: room_id, row: {$gte:row_start, $lte:row_end}},
                        {fields: {movie_title: 1, time: 1, roomName: 1, row: 1, column: 1, seat_id: 1, available: 1, _id:0},
                            sort: {available: 1}});
            }else{
                var res = Tickets.find({movie_id: movie_id, schedule_id: schedule_id, room_id: room_id, row: {$gte:row_start, $lte:row_end}},
                        {fields: {movie_title: 1, time: 1, roomName: 1, row: 1, column: 1, seat_id: 1, available: 1, _id:0},
                            sort: {number: 1}});
            }

            if (res.count()==0) {
                return {
                    'statusCode': 400,
                    'body': 'Not found'
                };
            }
            else{
                // need to format the response string as HATEOAS
                return {
                    'statusCode': 200,
                    'body': res.fetch()
                };
            }  
        }
    });

    //Check availability of the selected seat of the selected room for the selected schedule of the selected movie
    //GET /rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId> HTTP/1.1
    Api.addRoute('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId', {
        get: function () {
            var movie_id = Number(this.urlParams.movieId);
            var schedule_id = Number(this.urlParams.scheduleId);
            var room_id = Number(this.urlParams.roomId);
            var seat_id = Number(this.urlParams.seatId);

            var res = Tickets.find({seat_id: seat_id, movie_id: movie_id, schedule_id: schedule_id, room_id: room_id},
                    {fields: {movie_title: 1, time: 1, roomName: 1, row: 1, column: 1, seat_id: 1, available: 1, _id:0}});


            if (res.count()==0) {
                return {
                    'statusCode': 400,
                    'body': 'Not found'
                };
            }
            else{
                // need to format the response string as HATEOAS
                return {
                    'statusCode': 200,
                    'body': res.fetch()
                };
            } 
        }
    });

    //Book the selected seat of the selected room for the selected schedule of the selected movie
    //POST /rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>/order 
    Api.addRoute('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId/order', {
        post: function () {
            var movie_id = Number(this.urlParams.movieId);
            var schedule_id = Number(this.urlParams.scheduleId);
            var room_id = Number(this.urlParams.roomId);
            var seat_id = Number(this.urlParams.seatId);

            var res = Tickets.find({seat_id: seat_id, movie_id: movie_id, schedule_id: schedule_id, room_id: room_id, available: true},
                    {fields: {ticket_id: 1, movie_title: 1, time: 1, roomName: 1, room_id: 1, row: 1, column: 1, _id:0}});

            if (res.count()==0) {
                return {
                    'statusCode': 400,
                    'body': 'No ticket found'
                };
            }
            else{
                // update ticket and play info
                Tickets.update(
                        {seat_id: seat_id, movie_id: movie_id, schedule_id: schedule_id, room_id: room_id },
                        {
                            $set: {
                                available: false
                            }
                        }
                        )
                    Plays.update(
                            { movie_id: movie_id, schedule_id: schedule_id, room_id: room_id },
                            {
                                $inc: { availNum: -1 }
                            }
                            )

                    // need to format the response string as HATEOAS
                    return {
                        'statusCode': 200,
                        'body': Tickets.find({seat_id: seat_id, movie_id: movie_id, schedule_id: schedule_id, room_id: room_id},
                                {fields: {ticket_id: 1,  movie_title: 1, time: 1, roomName: 1, row: 1, column: 1, _id:0}}).fetch()
                    };
            }  
        }
    });

}
