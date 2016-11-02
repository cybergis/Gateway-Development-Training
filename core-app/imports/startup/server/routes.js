const querystring = require('querystring');

import { EJSON } from 'meteor/ejson';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/zodiase:check';
import { readAllSync } from 'meteor/zodiase:stream-read-all';

import { Movie } from '/imports/api/movies/server';
import { Room, RoomSeat } from '/imports/api/rooms/server';
import { Ticket, OrderRequest } from '/imports/api/tickets/server';

import { RestApi, API_Base, Response_404 } from '/imports/api/REST/server/v1';

// List all tickets
RestApi.addRoute('tickets', { authRequired: false }, _.defaults({
  get () {

    const cursor = Ticket.find({});

    // Provide both `statusCode` and `body` for `statusCode` to take effect.
    return {
      'statusCode': 200,
      'body': {
        links: {
          'self': RestApi.buildUrl('tickets', {})
        },
        rawData: Ticket.getCollection().find({}).fetch(),
        data: cursor.fetch()
        .map(({ _id, movieId, scheduleId, roomId, seatId, attributes }) => ({
          type: 'rooms',
          id: _id,
          attributes,
          relationships: {
            movie: {
              data: { type: 'movies', id: movieId }
            },
            schedule: {
              data: { type: 'schedules', id: String(scheduleId) }
            },
            room: {
              data: { type: 'rooms', id: roomId }
            },
            seat: {
              data: { type: 'seats', id: String(seatId) }
            }
          },
          links: {
            'self': RestApi.buildUrl('tickets/:_id', { _id })
          }
        }))
      }
    };

  }
}, API_Base));

// List all rooms
RestApi.addRoute('rooms', { authRequired: false }, _.defaults({
  get () {

    const cursor = Room.find({});

    // Provide both `statusCode` and `body` for `statusCode` to take effect.
    return {
      'statusCode': 200,
      'body': {
        links: {
          'self': RestApi.buildUrl('rooms', {})
        },
        data: cursor.fetch()
        .map(({ _id, attributes }) => ({
          type: 'rooms',
          id: _id,
          attributes,
          relationships: {},
          links: {
            'self': RestApi.buildUrl('rooms/:_id', { _id })
          }
        }))
      }
    };

  }
}, API_Base));

// List all scheduled movies
RestApi.addRoute('movies', { authRequired: false }, _.defaults({
  get () {

    const routeStartTime = Date.now();
    console.log('>> List all scheduled movies');

    const cursor = Movie.find({});
    console.log('Movie.find', Date.now() - routeStartTime);

    const movies = cursor.fetch();
    console.log('Movie.find.fetch', Date.now() - routeStartTime);

    const links = {
      'self': RestApi.buildUrl('movies', {})
    };
    console.log('links', Date.now() - routeStartTime);

    const data = movies
    .map(({ _id, attributes }) => ({
      type: 'movies',
      id: _id,
      attributes,
      relationships: {
        schedules: {
          links: {
            self: RestApi.buildUrl('movies/:_id/schedules', { _id })
          }
        }
      },
      links: {
        'self': RestApi.buildUrl('movies/:_id', { _id })
      }
    }))
    // Show only the movies that have been scheduled.
    .filter((movie) => movie.attributes.mostRecentScheduleAt !== null)
    // By time of the most recent schedule in ascending order.
    .sort((a, b) => a.attributes.mostRecentScheduleAt - b.attributes.mostRecentScheduleAt);
    console.log('data', Date.now() - routeStartTime);

    // Provide both `statusCode` and `body` for `statusCode` to take effect.
    return {
      'statusCode': 200,
      'body': { links, data }
    };

  }
}, API_Base));

// List all schedules of the selected movie
RestApi.addRoute('movies/:movieId/schedules', { authRequired: false }, _.defaults({
  get () {

    const routeStartTime = Date.now();
    console.log('>> List all schedules of the selected movie');

    const movieId = this.urlParams.movieId;

    // Find movie.
    const cursor = Movie.find({ _id: movieId }, {});
    console.log('Movie.find', Date.now() - routeStartTime);

    if (cursor.count() === 0) {
      return Response_404;
    }

    // Only get the first one, if multiple ones exist.
    const movie = cursor.fetch()[0];
    console.log('Movie.find.fetch', Date.now() - routeStartTime);

    const links = {
            'self': RestApi.buildUrl('movies/:movieId/schedules', { movieId })
          },
          included = [
            {
              type: 'movies',
              id: movieId,
              attributes: movie.attributes,
              links: {
                self: RestApi.buildUrl('movies/:movieId', { movieId })
              }
            }
          ];
    console.log('links & included', Date.now() - routeStartTime);

    const data = movie.schedules
    .map(({ _id, attributes }) => ({
      type: 'schedules',
      id: String(_id),
      attributes,
      relationships: {
        movie: {
          data: { type: 'movies', id: movieId }
        },
        rooms: {
          links: {
            self: RestApi.buildUrl('movies/:movieId/schedules/:_id/rooms', { movieId, _id })
          }
        }
      },
      links: {
        self: RestApi.buildUrl('movies/:movieId/schedules/:_id', { movieId, _id })
      }
    }))
    // By time of the schedule in ascending order.
    .sort((a, b) => a.attributes.startAt - b.attributes.startAt);
    console.log('data', Date.now() - routeStartTime);

    // Provide both `statusCode` and `body` for `statusCode` to take effect.
    return {
      'statusCode': 200,
      'body': { links, data, included }
    };

  }
}, API_Base));

// List all rooms of the selected schedule of the selected movie
RestApi.addRoute('movies/:movieId/schedules/:scheduleId/rooms', { authRequired: false }, _.defaults({
  get () {

    const routeStartTime = Date.now();
    console.log('>> List all rooms of the selected schedule of the selected movie');

    const movieId = this.urlParams.movieId,
          scheduleId = parseInt(this.urlParams.scheduleId, 10);

    // Find movie.
    const cursor = Movie.find({ _id: movieId }, {});
    console.log('Movie.find', Date.now() - routeStartTime);

    if (cursor.count() === 0) {
      return Response_404;
    }

    // Only get the first one, if multiple ones exist.
    const movie = cursor.fetch()[0];
    console.log('Movie.find.fetch', Date.now() - routeStartTime);

    // Find schedule.
    const schedule = movie.schedules.find((item) => Number(item.startAt) === scheduleId);
    console.log('movie.schedules.find', Date.now() - routeStartTime);

    if (!schedule) {
      return Response_404;
    }

    const links = {
            'self': RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms', { movieId, scheduleId })
          },
          included = [
            {
              type: 'movies',
              id: movieId,
              attributes: movie.attributes,
              links: {
                self: RestApi.buildUrl('movies/:movieId', { movieId })
              }
            },
            {
              type: 'schedules',
              id: String(scheduleId),
              attributes: schedule.attributes,
              links: {
                self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId', { movieId, scheduleId })
              }
            }
          ];
    console.log('links & included', Date.now() - routeStartTime);

    const data = schedule.rooms
    .map((roomId) => {
      const room = Room.findOne({ _id: roomId }),
            seatsBooked = Ticket.find({
              movieId,
              scheduleId,
              roomId
            }).count();
      return {
        type: 'rooms',
        id: roomId,
        attributes: _.defaults(room.attributes, {
          seatsAvailable: room.attributes.seatsCount - seatsBooked
        }),
        relationships: {
          movie: {
            data: { type: 'movies', id: movieId }
          },
          schedule: {
            data: { type: 'schedules', id: String(scheduleId) }
          },
          seats: {
            links: {
              self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats', { movieId, scheduleId, roomId })
            }
          }
        },
        links: {
          self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId', { movieId, scheduleId, roomId })
        }
      };
    })
    .sort((a, b) => b.attributes.seatsAvailable - a.attributes.seatsAvailable);
    console.log('data', Date.now() - routeStartTime);

    return {
      'statusCode': 200,
      'body': { links, data, included }
    };

  }
}, API_Base));

// List all seats of the selected room for the selected schedule of the selected movie
RestApi.addRoute('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats', { authRequired: false }, _.defaults({
  get () {

    const routeStartTime = Date.now();
    console.log('>> List all seats of the selected room for the selected schedule of the selected movie');

    const movieId = this.urlParams.movieId,
          scheduleId = parseInt(this.urlParams.scheduleId, 10),
          roomId = this.urlParams.roomId;

    // Find movie.
    const cursor = Movie.find({ _id: movieId }, {});
    console.log('Movie.find', Date.now() - routeStartTime);

    if (cursor.count() === 0) {
      return Response_404;
    }

    // Only get the first one, if multiple ones exist.
    const movie = cursor.fetch()[0];
    console.log('Movie.find.fetch', Date.now() - routeStartTime);

    // Find schedule.
    const schedule = movie.schedules.find((item) => Number(item.startAt) === scheduleId);
    console.log('movie.schedules.find', Date.now() - routeStartTime);

    if (!schedule) {
      return Response_404;
    }

    // Schedule has to have the room.
    if (!schedule.rooms.includes(roomId)) {
      return Response_404;
    }

    // Find room.
    const room = Room.findOne({ _id: roomId });
    console.log('Room.findOne', Date.now() - routeStartTime);

    if (!room) {
      return Response_404;
    }

    const tickets = Ticket.find({
      movieId,
      scheduleId,
      roomId
    }).fetch();
    console.log('Ticket.find', Date.now() - routeStartTime);

    const links = {
            self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats', { movieId, scheduleId, roomId })
          },
          included = [
            {
              type: 'movies',
              id: movieId,
              attributes: movie.attributes,
              links: {
                self: RestApi.buildUrl('movies/:movieId', { movieId })
              }
            },
            {
              type: 'schedules',
              id: String(scheduleId),
              attributes: schedule.attributes,
              links: {
                self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId', { movieId, scheduleId })
              }
            },
            {
              type: 'rooms',
              id: roomId,
              attributes: room.attributes,
              links: {
                self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId', { movieId, scheduleId, roomId })
              }
            }
          ];
    console.log('links & included', Date.now() - routeStartTime);

    const {
      sort,
      filter
    } = this.queryParams;

    let sortFunc;
    switch (sort) {
      case 'available':
        sortFunc = (a, b) => a.attributes.available === b.attributes.available ? a.id - b.id : b.attributes.available - a.attributes.available;
        break;
      case 'name':
        // Intentionally drop through.
      default:
        sortFunc = (a, b) => a.id - b.id;
        break;
    }

    const filterFuncs = [];
    let {
      row_start,
      row_end
    } = querystring.parse(filter, ';', ':');
    row_start = parseInt(row_start, 10);
    row_end = parseInt(row_end, 10);

    if (!isNaN(row_start)) {
      filterFuncs.push((seat) => seat.attributes.row >= row_start);
    }
    if (!isNaN(row_end)) {
      filterFuncs.push((seat) => seat.attributes.row <= row_end);
    }

    const data = _.times(room.attributes.seatsCount, (seatId) => ({
      // Index/seatId is 0-based. Seat Number is 1-based.
      type: 'seats',
      id: String(seatId),
      attributes: _.defaults(new RoomSeat({
        movieId,
        scheduleId,
        roomId,
        seatId
      }).attributes, {
        available: !tickets.some((ticket) => ticket.seatId === seatId)
      }),
      relationships: {
        movie: {
          data: { type: 'movies', id: movieId }
        },
        schedule: {
          data: { type: 'schedules', id: String(scheduleId) }
        },
        room: {
          data: { type: 'rooms', id: roomId }
        }
      },
      links: {
        self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId', { movieId, scheduleId, roomId, seatId: seatId })
      }
    }))
    .filter((seat) => filterFuncs.length > 0 ? filterFuncs.every((func) => func(seat)) : true)
    .sort(sortFunc);
    console.log('data', Date.now() - routeStartTime);

    return {
      'statusCode': 200,
      'body': { links, data, included }
    };

  }
}, API_Base));

// Check availability of the selected seat of the selected room for the selected schedule of the selected movie
RestApi.addRoute('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId', { authRequired: false }, _.defaults({
  get () {

    const movieId = this.urlParams.movieId,
          scheduleId = parseInt(this.urlParams.scheduleId, 10),
          roomId = this.urlParams.roomId,
          seatId = parseInt(this.urlParams.seatId, 10);

    // Find movie.
    const cursor = Movie.find({ _id: movieId }, {});

    if (cursor.count() === 0) {
      return Response_404;
    }

    // Only get the first one, if multiple ones exist.
    const movie = cursor.fetch()[0];

    // Find schedule.
    const schedule = movie.schedules.find((item) => Number(item.startAt) === scheduleId);

    if (!schedule) {
      return Response_404;
    }

    // Schedule has to have the room.
    if (!schedule.rooms.includes(roomId)) {
      return Response_404;
    }

    // Find room.
    const room = Room.findOne({ _id: roomId });

    if (!room) {
      return Response_404;
    }

    // Room has to have the seat.
    if (seatId >= room.attributes.seatsCount) {
      return Response_404;
    }

    const seat = new RoomSeat({
      movieId,
      scheduleId,
      roomId,
      seatId
    });

    return {
      'statusCode': 200,
      'body': {
        data: {
          type: 'seats',
          id: String(seatId),
          attributes: seat.attributes,
          relationships: {
            movie: {
              data: { type: 'movies', id: movieId }
            },
            schedule: {
              data: { type: 'schedules', id: String(scheduleId) }
            },
            room: {
              data: { type: 'rooms', id: roomId }
            }
          },
          links: {
            self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId', { movieId, scheduleId, roomId, seatId }),
            order: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId/order', { movieId, scheduleId, roomId, seatId })
          }
        }
      }
    };
  }
}, API_Base));

// Book the selected seat of the selected room for the selected schedule of the selected movie
RestApi.addRoute('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId/order', { authRequired: false }, _.defaults({
  post () {

    const movieId = this.urlParams.movieId,
          scheduleId = parseInt(this.urlParams.scheduleId, 10),
          roomId = this.urlParams.roomId,
          seatId = parseInt(this.urlParams.seatId, 10);

    // Find movie.
    const cursor = Movie.find({ _id: movieId }, {});

    if (cursor.count() === 0) {
      return Response_404;
    }

    // Only get the first one, if multiple ones exist.
    const movie = cursor.fetch()[0];

    // Find schedule.
    const schedule = movie.schedules.find((item) => Number(item.startAt) === scheduleId);

    if (!schedule) {
      return Response_404;
    }

    // Schedule has to have the room.
    if (!schedule.rooms.includes(roomId)) {
      return Response_404;
    }

    // Find room.
    const room = Room.findOne({ _id: roomId });

    if (!room) {
      return Response_404;
    }

    // Room has to have the seat.
    if (seatId >= room.attributes.seatsCount) {
      return Response_404;
    }

    const seat = new RoomSeat({
      movieId,
      scheduleId,
      roomId,
      seatId
    });


    // Check if seat is available.
    if (!seat.attributes.available) {
      return {
        'statusCode': 409,
        'body': 'Seat not available.'
      };
    }

    // Verify input.
    const orderRequest = new OrderRequest(this.bodyParams.data);
    try {
      orderRequest.validate();
    } catch (err) {
      return {
        'statusCode': 400,
        'body': 'Invalid order info.'
      };
    }

    // Generate new ticket.
    const newTicket = new Ticket({
      firstname: orderRequest.firstname,
      lastname: orderRequest.lastname,
      movieId,
      scheduleId,
      roomId,
      seatId
    });
    try {
      newTicket.save();
    } catch (err) {
      return {
        'statusCode': 409,
        'body': err.message
      };
    }

    const ticketId = newTicket._id,
          ticket = Ticket.findOne({ _id: ticketId });

    return {
      'statusCode': 201,
        'headers': {
          'Location': RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId/order/:ticketId', { movieId, scheduleId, roomId, seatId, ticketId })
        },
      'body': {
        data: {
          type: 'tickets',
          id: ticketId,
          attributes: ticket.attributes,
          relationships: {
            movie: {
              data: { type: 'movies', id: movieId }
            },
            schedule: {
              data: { type: 'schedules', id: String(scheduleId) }
            },
            room: {
              data: { type: 'rooms', id: roomId }
            },
            seat: {
              data: { type: 'seats', id: String(seatId) }
            }
          },
          links: {
            self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId/order/:ticketId', { movieId, scheduleId, roomId, seatId, ticketId })
          }
        },
        included: [
          {
            type: 'movies',
            id: movieId,
            attributes: movie.attributes,
            links: {
              self: RestApi.buildUrl('movies/:movieId', { movieId })
            }
          },
          {
            type: 'schedules',
            id: String(scheduleId),
            attributes: schedule.attributes,
            links: {
              self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId', { movieId, scheduleId })
            }
          },
          {
            type: 'rooms',
            id: roomId,
            attributes: room.attributes,
            links: {
              self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId', { movieId, scheduleId, roomId })
            }
          },
          {
            type: 'seats',
            id: String(seatId),
            attributes: seat.attributes,
            links: {
              self: RestApi.buildUrl('movies/:movieId/schedules/:scheduleId/rooms/:roomId/seats/:seatId', { movieId, scheduleId, roomId, seatId })
            }
          }
        ]
      }
    };
  }
}, API_Base));
