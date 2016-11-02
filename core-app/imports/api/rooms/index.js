import { Mongo } from 'meteor/mongo';
import { Class } from 'meteor/jagi:astronomy';

// import { Ticket } from '/imports/api/tickets';

/**
 * Defines the following validators:
 * - integer
 * - bbox
 */
import '/imports/modules/astronomy-validators';

const validator_positiveInteger = [
  { type: 'integer' },
  { type: 'gt', param: 0 }
];

export const rawCollection = new Mongo.Collection('rooms');

export const Room = Class.create({
  name: 'Room',
  collection: rawCollection,
  fields: {
    // Title used for displaying and sorting.
    title: {
      type: String,
      validators: [
        { type: 'minLength', param: 3 },
        { type: 'maxLength', param: 128 }
      ]
    },
    rows: {
      type: Number,
      validators: validator_positiveInteger
    },
    columns: {
      type: Number,
      validators: validator_positiveInteger
    }
  },
  events: {
    afterInit(e) {
      const room = e.currentTarget;

      const {
        title,
        createdAt,
        updatedAt,
        rows,
        columns
      } = room;

      const seatsCount = rows * columns;

      room.attributes = {
        title,
        createdAt,
        updatedAt,
        rows,
        columns,
        seatsCount
      };

    }
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'createdAt',
      hasUpdatedField: true,
      updatedFieldName: 'updatedAt'
    }
  }
});

export const RoomSeat = Class.create({
  name: 'RoomSeat',
  fields: {
    movieId: String,
    scheduleId: {
      type: Number,
      validators: validator_positiveInteger
    },
    roomId: String,
    seatId: {
      type: Number,
      validators: validator_positiveInteger
    }
  },
  events: {
    afterInit(e) {
      const seat = e.currentTarget;

      const {
        movieId,
        scheduleId,
        roomId,
        seatId
      } = seat;

      const room = Room.findOne({ _id: roomId });

      seat.attributes = {
        number: seatId + 1,
        row: Math.floor(seatId / room.columns) + 1,
        column: seatId % room.columns + 1
        // Takes too much time to do db query for every one.
//         available: Ticket.find({
//           movieId,
//           scheduleId,
//           roomId: room._id,
//           seatId
//         }).count() === 0
      };

    }
  }
});
