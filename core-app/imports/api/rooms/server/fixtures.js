import { Room } from '..';

Meteor.startup(() => {
  //Room.remove({});
  if (Room.find({}).count() === 0) {

    console.log('Rooms/fixture', 'Initializing data...');

    var theOnlyRoom = new Room({
      title: 'The Only Room on Earth',
      rows: 20,
      columns: 20
    });
    theOnlyRoom.save();

  }
});
