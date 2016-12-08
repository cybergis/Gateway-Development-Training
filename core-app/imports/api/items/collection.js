import { Mongo } from 'meteor/mongo';

const collection = new Mongo.Collection('items');

export default collection;

