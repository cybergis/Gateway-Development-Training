import { Movie, MovieSchedule } from '..';
import { Room } from '/imports/api/rooms/server';

Meteor.startup(() => {
  //Movie.remove({});
  if (Movie.find({}).count() === 0) {

    console.log('Movies/fixture', 'Initializing data...');

    const dateNow = new Date(),
          timeNow = Number(dateNow),
          timeThisDay = timeNow - timeNow % (1000 * 60 * 60 * 24) + 1000 * 60 * dateNow.getTimezoneOffset();

    var theOnlyMovie = new Movie();
    theOnlyMovie.title = 'The Only Movie on Earth';
    theOnlyMovie.schedules = [7, 14].reduce((result, days) => {
      return [6, 9, 15, 18, 21].reduce((result, hours) => {
        const schedule = new MovieSchedule();
        schedule.startAt = new Date(timeThisDay + 1000 * 60 * 60 * 24 * days + 1000 * 60 * 60 * hours);
        schedule.price = 19.99;
        // Since there is only one movie, this one movie takes all the rooms.
        schedule.rooms = Room.find({}).fetch().map((room) => room._id);
        result.push(schedule);
        return result;
      }, result);
    }, []);
    theOnlyMovie.save();

  }
});
