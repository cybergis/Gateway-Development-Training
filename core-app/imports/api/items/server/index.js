import { check, Match } from 'meteor/check';
import { Mongo } from 'meteor/mongo';

import collection from '../collection';

check(collection, Mongo.Collection);

import './fixtures';

export {
  collection
};
