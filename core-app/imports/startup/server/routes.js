// Define all the routes here.

import { _ } from 'meteor/underscore';

import { collection } from '/imports/api/items/server';

import { RestApi, API_Base, Response_404, Response_501 } from '/imports/api/REST/server/v1';

RestApi.addRoute('items', { authRequired: false }, _.defaults({

  // List all items.
  get () {

    console.log('get items');

    const cursor = collection.find({});

    // Provide both `statusCode` and `body` for `statusCode` to take effect.
    return {
      'statusCode': 200,
      'body': {
        data: cursor.fetch()
        .map(({ _id, createdAt }) => ({
          type: 'items',
          id: _id,
          attributes: {
            createdAt
          }
        }))
      }
    };

  },

  // Add new item.
  post () {

    //! Write your code here to process the request data and return a meaningful response.
    return Response_501;

  }

}, API_Base));

RestApi.addRoute('items/:itemId', { authRequired: false }, _.defaults({

  // Show details of the item.
  get () {

    const itemId = this.urlParams.itemId,
          cursor = collection.find({ _id: itemId });

    if (cursor.count() === 0) {
      return Response_404;
    }

    const item = cursor.fetch()[0];

    // Provide both `statusCode` and `body` for `statusCode` to take effect.
    return {
      'statusCode': 200,
      'body': {
        data: (({ _id, ...others }) => ({
          type: 'items',
          id: _id,
          attributes: {
            ...others
          }
        }))(item)
      }
    };

  },

  // Update the item.
  put () {

    //! Write your code here to process the request data and return a meaningful response.
    return Response_501;

  },

  // Delete the item.
  delete () {

    //! Write your code here to process the request data and return a meaningful response.
    return Response_501;

  }

}, API_Base));
