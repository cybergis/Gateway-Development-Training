import { Room } from '..';

Meteor.startup(() => {
  //Room.remove({});
  if (Room.find({}).count() === 0) {

    console.log('Rooms/fixture', 'Initializing data...');

    var theOnlyRoom = new Room();
    theOnlyRoom.title = 'The Only Room on Earth';
    theOnlyRoom.rows = 20;
    theOnlyRoom.columns = 20;
    theOnlyRoom.save();

  }
});
