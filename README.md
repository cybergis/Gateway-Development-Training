# Stage 3 - Core Application Development, RESTful Service

## Goal

Learn how to develop the most fundamental part of a web application: the server logic, database and REST APIs. Know how to use the Meteor package system to take advantage of existing Atmosphere and Npm packages.

## Materials

One specification on building JSON REST APIs: [http://jsonapi.org/](http://jsonapi.org/)

Another specification: [https://labs.omniti.com/labs/jsend](https://labs.omniti.com/labs/jsend)

There is no must-follow specification as REST style itself is highly flexible.

For implementing the REST APIs, [this guide](http://meteorpedia.com/read/REST_API) introduces a few of the many possible approaches.

## Submission

***Branch from `stage-3`, finish everything described below and create PR back against base branch `stage-3`.***

We are developing a simplified movie theater ticketing system. The database design is up to you but the system has to meet a set of requirements on the REST APIs. Check the “Grading” section for implementation requirements.

A customer typically goes through such a process to book a ticket:

0. List all movies that are scheduled (for the next 30 days, in alphabetical order or temporal order)
0. Pick a movie, and list all scheduled plays (for the next 30 days, in temporal order, filterable by date)
0. Pick a play, and list all rooms for that movie at that time and their availability (how many seats are available) (in room number order or availability order).
0. Pick a room, and list all seats for that room at that time and their availability (in seat number order or availability order).
0. Pick a seat, and post order info to book the seat at that room for that play at that time, and get the ticket number or an error explaining why it didn't work.

To simplify the requirements for this training, we make the following assumptions:

0. We offer only one movie.
0. There is only one room.
0. Each room must have at least 400 seats. (You can take it as exactly 400 seats)
0. Plays are scheduled every 3 hours. 10 minutes cleanup and the rest for the movie. If the movie is shorter, we fill the void time with ads.
0. The plays start on the hour (so exactly on 0am, 3am, 6am and etc. So exactly 8 slots per day per room.)
0. There must be at least 10 different schedules for each movie.
0. The customer can only book one ticket at a time.
0. The customer can not cancel or refund the ticket once booked.
0. The order details are provided with the ticket number, but the customer can not verify/lookup the order details with the ticket number.

You would have to add code to fill in preset data for grading. Refer to the *fixtures* used in the last stage.

Advanced requirements:

0. Database design efficiency

## Grading

- Fundamental
    - Your app folder should be named `"core-app"` and created under root of the repo.
    - Your app should be running solely on port `3000`.
    - The grader will start your app by `meteor npm install && meteor run`.
    - The grader will test the app against the [REST API expectations](./requirements.md).
- Advanced
    - Performance (how fast can the operations be done, hinting db design) competition
