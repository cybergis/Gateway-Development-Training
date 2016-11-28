import { check, Match } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';

import collection from '../collection';

check(collection, Mongo.Collection);

const PRESET_DATA_COUNT = 10;

Meteor.startup(() => {

  collection.remove({});

  if (collection.find({}).count() === 0) {

    console.log('Initializing data...');

    for (let i = 0, n = PRESET_DATA_COUNT; i < n; ++i) {
      collection.insert({
        createdAt: new Date(),
        secret: Random.secret()
      });
    }

    console.log('Data initialization completed.');

  }

});
