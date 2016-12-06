/**
 * This file defines common fundations for sets of similar APIs.
 * For example, a group APIs may not require authentication and always uses JSON output.
 */

import { Meteor } from 'meteor/meteor';
import { Restivus } from 'meteor/nimble:restivus';

// Global API configuration
export const RestApi = new Restivus({
  apiPath: 'rest/',
  version: 'v1',
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

export const Response_501 = {
  'statusCode': 501,
  'body': 'Method not implemented.'
};

export const API_Base = {
  get: () => Response_405,
  post: () => Response_405,
  put: () => Response_405,
  patch: () => Response_405,
  delete: () => Response_405,
  options: () => Response_405
};
