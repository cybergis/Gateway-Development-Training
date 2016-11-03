import { Mongo } from 'meteor/mongo';
import { Class } from 'meteor/jagi:astronomy';

export const rawCollection = new Mongo.Collection('tickets');

export const OrderRequest = Class.create({
  name: 'OrderRequest',
  fields: {
    firstname: {
      type: String,
      validators: [
        { type: 'minLength', param: 3 },
        { type: 'maxLength', param: 128 }
      ]
    },
    lastname: {
      type: String,
      validators: [
        { type: 'minLength', param: 3 },
        { type: 'maxLength', param: 128 }
      ]
    }
  }
});

export const Ticket = Class.create({
  name: 'Ticket',
  collection: rawCollection,
  fields: {
    firstname: {
      type: String,
      validators: [
        { type: 'minLength', param: 3 },
        { type: 'maxLength', param: 128 }
      ]
    },
    lastname: {
      type: String,
      validators: [
        { type: 'minLength', param: 3 },
        { type: 'maxLength', param: 128 }
      ]
    },
    movieId: {
      type: String,
      index: 1
    },
    scheduleId: {
      type: Number,
      index: 1
    },
    roomId: {
      type: String,
      index: 1
    },
    seatId: {
      type: Number,
      index: 1
    }
  },
  events: {
    afterInit(e) {
      const ticket = e.currentTarget;

      const {
        createdAt,
        firstname,
        lastname
      } = ticket;

      ticket.attributes = {
        createdAt,
        firstname,
        lastname
      };

    },
    beforeInsert(e) {
      const ticket = e.currentTarget;

      const {
        movieId,
        scheduleId,
        roomId,
        seatId
      } = ticket;

      if (rawCollection.find({
        movieId,
        scheduleId,
        roomId,
        seatId
      }).count() > 0) {
        throw new Error('Ticket already sold.');
      }
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
