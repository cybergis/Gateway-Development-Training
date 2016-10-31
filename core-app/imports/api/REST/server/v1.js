import { Meteor } from 'meteor/meteor';

// Use customized `Restivus` instead.
import { Restivus } from '/imports/modules/Restivus/server';
//import { Restivus } from 'meteor/nimble:restivus';

//import { Authenticate } from '/imports/modules/GatewayAuth/server';

// Global API configuration
export const RestApi = new Restivus({
  apiPath: 'rest/',
  version: 'v1',
//   auth: {
//     user () {
//       /**
//        * @type {Object} this.request
//        * @type {Object} this.response
//        * @type {Object} this.urlParams
//        * @type {Object} this.queryParams
//        */
//       const req = this.request,
//             username = String(req.headers['x-user-name']),
//             token = String(req.headers['x-auth-token']),
//             remote_addr = req.connection.remoteAddress;
//
//       const userId = Authenticate(username, token, remote_addr);
//
//       return {
//         user: Meteor.users.findOne({ _id: userId })
//       };
//     }
//   },
  useDefaultAuth: false,
  prettyJson: true
});

export const Response_404 = {
  'statusCode': 404,
  'body': 'Not found.'
};

export const Response_405 = {
  'statusCode': 405,
  'body': 'Method not allowed.'
};

export const API_Base = {
  get: () => Response_405,
  post: () => Response_405,
  put: () => Response_405,
  patch: () => Response_405,
  delete: () => Response_405,
  options: () => Response_405
};
