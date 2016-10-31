import { Mongo } from 'meteor/mongo';
import { Class } from 'meteor/jagi:astronomy';

/**
 * Defines the following validators:
 * - integer
 * - bbox
 */
// import '/imports/modules/astronomy-validators';

// const validator_positiveInteger = [
//   { type: 'integer' },
//   { type: 'gt', param: 0 }
// ];

export const rawCollection = new Mongo.Collection('movies');

export const MovieSchedule = Class.create({
  name: 'MovieSchedule',
  fields: {
    startAt: Date,
    price: Number,
    rooms: [String]
  },
  events: {
    afterInit(e) {
      const schedule = e.currentTarget;

      const {
        startAt,
        price,
        rooms
      } = schedule;

      schedule.attributes = {
        startAt,
        price
      };

      schedule._id = Number(schedule.startAt);
    }
  }
});

export const Movie = Class.create({
  name: 'Movie',
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
    schedules: [MovieSchedule]
  },
  events: {
    afterInit(e) {
      const movie = e.currentTarget;

      const {
        title,
        createdAt,
        updatedAt,
        schedules
      } = movie;

      movie.attributes = {
        title,
        createdAt,
        updatedAt,
        // If there is at least one schedule, sort them and return the first one (earlest), otherwise return null.
        mostRecentScheduleAt: schedules.length > 0 ? schedules.sort((a, b) => a.startAt - b.startAt)[0].startAt : null
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
