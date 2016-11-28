# Stage 3 - Core Application Development, RESTful Service

## Sub-stage 1 - [Remote Procedure Calls (RPC)](https://en.wikipedia.org/wiki/Remote_procedure_call)

### Goal

Learn how to implement RPCs that meet the requirements.

HTTP RPC is the fundation of HTTP Restful APIs.

Learn the fact that what people have been calling REST APIs are actually just RPCs.

### Materials

- [Wikipedia / Remote Procedure Call](https://en.wikipedia.org/wiki/Remote_procedure_call)
- [Richardson Maturity Model](http://martinfowler.com/articles/richardsonMaturityModel.html)
- [A Blog by Roy Fielding](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)
- [Wikipedia / Roy Fielding](https://en.wikipedia.org/wiki/Roy_Fielding)
- [How to Debug REST API](https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=how%20to%20debug%20rest%20api)
- [REST Client](https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=rest+client)

### Submission

0. Branch from `stage-3.1`, name the new branch `"stage-3.1__your-name"` (without quotes; notice the *double-underscore*).
0. Edit `/core-app/imports/api/items/collection.js` so it properly exports a MongoDB collection.

   To see what is considered "proper", check files that require/imports this file. *(Hint: check some server-only code nearby.)*

0. Edit `/core-app/imports/startup/server/routes.js` so `"Add new item."` section is functional.

   Upon receiving a POST request such as:
   ```
   POST /rest/v1/items HTTP/1.1
   Content-Type: application/json; charset=utf-8
   Host: localhost:3000
   Connection: close

   {
     "data": {
       "secret": <SomeString>
     }
   }
   ```
   The server should respond with status code `201`, proper header indicating the response is UTF-8 JSON and body:
   ```
   {
     "data": {
       "type": 'items',
       "id": <SomeID>,
       "attributes": {
         "createdAt": <SomeDate>,
         "secret": <SomeString>
       }
     }
   }
   ```
   where `<SomeID>` is the ID of the record, `<SomeDate>` is the creation date of the record (should be an instance of `Date`) and `<SomeString>` matches the request data.

0. Edit `/core-app/imports/startup/server/routes.js` so `"Update the item."` section is functional.

   Upon receiving a PUT request such as:
   ```
   PUT /rest/v1/items/<SomeID> HTTP/1.1
   Content-Type: application/json; charset=utf-8
   Host: localhost:3000
   Connection: close

   {
     "data": {
       "secret": <SomeNewString>
     }
   }
   ```
   The server should respond with status code `200`, proper header indicating the response is UTF-8 JSON and body:
   ```
   {
     "data": {
       "type": 'items',
       "id": <SomeID>,
       "attributes": {
         "createdAt": <SomeDate>,
         "secret": <SomeNewString>
       }
     }
   }
   ```
   where `<SomeID>` is the ID of the record, `<SomeDate>` is the creation date of the record (should be an instance of `Date`) and `<SomeNewString>` matches the request data.

0. Edit `/core-app/imports/startup/server/routes.js` so `"Delete the item."` section is functional.

   Upon receiving a DELETE request such as:
   ```
   DELETE /rest/v1/items/<SomeID> HTTP/1.1
   Host: localhost:3000
   Connection: close
   ```
   The server should respond with status code `200`, proper header indicating the response is UTF-8 JSON and body:
   ```
   {
     "data": {
       "type": 'items',
       "id": <SomeID>,
       "attributes": {
         "createdAt": <SomeDate>,
         "secret": <SomeString>
       }
     }
   }
   ```
   where `<SomeID>` is the ID of the record, `<SomeDate>` is the creation date of the record (should be an instance of `Date`) and `<SomeString>` is the value of the stored property of the record.

0. Commit your changes to your new branch.
0. Create a pull request from your branch to base branch `stage-3.1`. Please name the PR `"Stage 3.1 Submission <your-name>"`.

### Grading

- If the branch name and/or the PR is not created properly, you fail with no partial credit.
- If the app could not run, for any reason, you fail with no partial credit.
- If you modify anything you are not supposed to change in order to pass the test, you fail with no partial credit.
- If the required collection isn't properly exported, the app most likely won't run so you most likely will fail with no partial credit.
- 1 point for properly handling good POST requests. After a POST request with proper request data, a new data record should be created. The length of the record list should increase. The new data record should be accessible with the prepared APIs.
- 1 point for properly handling good PUT requests. After a PUT request with proper request data, the corresponding data record should be updated with the request data. The updated data should be accessible with the prepared APIs.
- 1 point for properly handling good DELETE requests. After a DELETE request with proper request data, the corresponding data record should no longer be accessible. The length of the record list should reduce.
- (extra point) for properly handling bad requests.
