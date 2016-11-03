import { Restivus } from 'meteor/nimble:restivus';
import { patch as patch_buildUrl } from 'meteor/zodiase:restivus-build-url';

patch_buildUrl(Restivus);

export {
  Restivus
};
