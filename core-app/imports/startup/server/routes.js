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
    const secret = this.bodyParams.data.secret;
    const time = new Date();
    const id = collection.insert({
        createdAt: time,
        secret: secret
      });
    return {
      statusCode: 201,
      body: {
        data:{
          type:"items",
          id:id,
          attributes:{
            createdAt: time,
            secret: secret
          }
        }
      } 
    };

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
    const itemId = this.urlParams.itemId,
          cursor = collection.find({ _id: itemId });
    const secret = this.bodyParams.data.secret;
    
    if (cursor.count() === 0) {
      return Response_404;
    }

    const item = cursor.fetch()[0];
    collection.update({_id: item._id},{
        $set:{
          secret: secret
        }
      });

    // Provide both `statusCode` and `body` for `statusCode` to take effect.
    return {
      statusCode: 201,
      body: {
        data:{
          type:"items",
          id:item._id,
          attributes:{
            createdAt: item.createdAt,
            secret: secret
          }
        }
      } 
    };

  },

  // Delete the item.
  delete () {

    //! Write your code here to process the request data and return a meaningful response.
    const itemId = this.urlParams.itemId,
          cursor = collection.find({ _id: itemId });

    if (cursor.count() === 0) {
      return Response_404;
    }

    const item = cursor.fetch()[0];
    collection.remove(item._id);

    // Provide both `statusCode` and `body` for `statusCode` to take effect.
    return {
      statusCode: 201,
      body: {
        data:{
          type:"items",
          id:item._id,
          attributes:{
            createdAt: item.createdAt,
            secret: item.secret
          }
        }
      } 
    };
  }

}, API_Base));
