# REST API expectations/requirements

- For any type of client errors, MUST always respond with status code `4**`.
- For all successful requests, MUST always respond with status code `2**`.
- All response content type MUST be `application/json`.

## List all scheduled movies

### Request
```
GET /rest/v1/movies HTTP/1.1
Host: localhost:3000
Connection: close
```

- Sorting: By time of the most recent schedule in ascending order

### Response

```JavaScript
// On Success
{
  links: {
    self: '/rest/v1/movies'
  },
  data: [
    {
      type: 'movies',
      id: '<someMovieId>',
      attributes: {
        title: String,
        mostRecentScheduleAt: Date
      },
      relationships: {
        schedules: {
          links: {
            self: '/rest/v1/movies/<someMovieId>/schedules'
          }
        }
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>'
      }
    },
    ...
  ]
}
```

## List all schedules of the selected movie

### Request
```
GET /rest/v1/movies/<someMovieId>/schedules HTTP/1.1
Host: localhost:3000
Connection: close
```

- Sorting: By time of the schedule in ascending order

### Response

```JavaScript
// On Success
{
  links: {
    self: '/rest/v1/movies/<someMovieId>/schedules'
  },
  data: [
    {
      type: 'schedules',
      id: '<someScheduleId>',
      attributes: {
        startAt: Date,
        price: Number
      },
      relationships: {
        movie: {
          data: { type: 'movies', id: '<someMovieId>' }
        },
        rooms: {
          links: {
            self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms'
          }
        }
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>'
      }
    },
    ...
  ],
  included: [
    {
      type: 'movies',
      id: '<someMovieId>',
      attributes: {
        title: String
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>'
      }
    }
  ]
}
```

## List all rooms of the selected schedule of the selected movie

### Request
```
GET /rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms HTTP/1.1
Host: localhost:3000
Connection: close
```

- Sorting: By number of available seats in descending order

### Response

```JavaScript
// On Success
{
  links: {
    self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms'
  },
  data: [
    {
      type: 'rooms',
      id: '<someRoomId>',
      attributes: {
        title: String,
        rows: Number,
        columns: Number
      },
      relationships: {
        movie: {
          data: { type: 'movies', id: '<someMovieId>' }
        },
        schedule: {
          data: { type: 'schedules', id: '<someScheduleId>' }
        },
        seats: {
          links: {
            self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats'
          }
        }
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>'
      }
    },
    ...
  ],
  included: [
    {
      type: 'movies',
      id: '<someMovieId>',
      attributes: {
        title: String
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>'
      }
    },
    {
      type: 'schedules',
      id: '<someScheduleId>',
      attributes: {
        startAt: Date,
        price: Number
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>'
      }
    }
  ]
}
```

## List all seats of the selected room for the selected schedule of the selected movie

### Request
```
GET /rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats[?sort&filter] HTTP/1.1
Host: localhost:3000
Connection: close
```

- Sorting
    - By seat number in ascending order (default)
        - Url Parameter: `sort=name`
    - By seat availability and then seat number
        - Url Parameter: `sort=available`
- Filtering
    - By seat rows
        - Url Parameter: `filter=row_start:<number>;row_end:<number>`

### Response

```JavaScript
// On Success
{
  links: {
    self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats'
  },
  data: [
    {
      type: 'seats',
      id: '<someSeatId>',
      attributes: {
        number: Number,
        row: Number,
        column: Number,
        available: Boolean
      },
      relationships: {
        movie: {
          data: { type: 'movies', id: '<someMovieId>' }
        },
        schedule: {
          data: { type: 'schedules', id: '<someScheduleId>' }
        },
        room: {
          data: { type: 'rooms', id: '<someRoomId>' }
        }
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>'
      }
    }
  ],
  included: [
    {
      type: 'movies',
      id: '<someMovieId>',
      attributes: {
        title: String
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>'
      }
    },
    {
      type: 'schedules',
      id: '<someScheduleId>',
      attributes: {
        startAt: Date,
        price: Number
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>'
      }
    },
    {
      type: 'rooms',
      id: '<someRoomId>',
      attributes: {
        title: String,
        rows: Number,
        columns: Number
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>'
      }
    }
  ]
}
```

## Check availability of the selected seat of the selected room for the selected schedule of the selected movie

### Request
```
GET /rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId> HTTP/1.1
Host: localhost:3000
Connection: close
```

### Response

```JavaScript
// On Success
{
  data: {
    type: 'seats',
    id: '<someSeatId>',
    attributes: {
      number: Number,
      row: Number,
      column: Number,
      available: Boolean
    },
    relationships: {
      movie: {
        data: { type: 'movies', id: '<someMovieId>' }
      },
      schedule: {
        data: { type: 'schedules', id: '<someScheduleId>' }
      },
      room: {
        data: { type: 'rooms', id: '<someRoomId>' }
      }
    },
    links: {
      self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>',
      order: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>/order'
    }
  },
  included: [
    {
      type: 'movies',
      id: '<someMovieId>',
      attributes: {
        title: String
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>'
      }
    },
    {
      type: 'schedules',
      id: '<someScheduleId>',
      attributes: {
        startAt: Date,
        price: Number
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>'
      }
    },
    {
      type: 'rooms',
      id: '<someRoomId>',
      attributes: {
        title: String,
        rows: Number,
        columns: Number
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>'
      }
    }
  ]
}
```

## Book the selected seat of the selected room for the selected schedule of the selected movie

### Request
```
POST /rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>/order HTTP/1.1
Content-Type: application/json; charset=utf-8
Host: localhost:3000
Connection: close

{
  data: {
    firstname: String,
    lastname: String
  }
}
```

### Response

```JavaScript
// On Success
{
  data: {
    type: 'tickets',
    id: '<someTicketId>',
    attributes: {
      createdAt: Date,
      firstname: String,
      lastname: String
    },
    relationships: {
      movie: {
        data: { type: 'movies', id: '<someMovieId>' }
      },
      schedule: {
        data: { type: 'schedules', id: '<someScheduleId>' }
      },
      room: {
        data: { type: 'rooms', id: '<someRoomId>' }
      },
      seat: {
        data: { type: 'seats', id: '<someSeatId>' }
      }
    },
    links: {
      self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>/order/<someTicketId>'
    }
  },
  included: [
    {
      type: 'movies',
      id: '<someMovieId>',
      attributes: {
        title: String
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>'
      }
    },
    {
      type: 'schedules',
      id: '<someScheduleId>',
      attributes: {
        startAt: Date,
        price: Number
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>'
      }
    },
    {
      type: 'rooms',
      id: '<someRoomId>',
      attributes: {
        title: String,
        rows: Number,
        columns: Number
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>'
      }
    },
    {
      type: 'seats',
      id: '<someSeatId>',
      attributes: {
        number: Number,
        row: Number,
        column: Number,
        available: Boolean
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>'
      }
    }
  ]
}
```

## Check ticket info (optional)

### Request
```
POST /rest/v1/tickets/<someTicketId> HTTP/1.1
Content-Type: application/json; charset=utf-8
Host: localhost:3000
Connection: close

{
  data: {
    firstname: String,
    lastname: String
  }
}
```

### Response

```JavaScript
// On Success
{
  data: {
    type: 'tickets',
    id: '<someTicketId>',
    attributes: {
      createdAt: Date,
      firstname: String,
      lastname: String
    },
    relationships: {
      movie: {
        data: { type: 'movies', id: '<someMovieId>' }
      },
      schedule: {
        data: { type: 'schedules', id: '<someScheduleId>' }
      },
      room: {
        data: { type: 'rooms', id: '<someRoomId>' }
      },
      seat: {
        data: { type: 'seats', id: '<someSeatId>' }
      }
    },
    links: {
      self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>/order/<someTicketId>'
    }
  },
  included: [
    {
      type: 'movies',
      id: '<someMovieId>',
      attributes: {
        title: String
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>'
      }
    },
    {
      type: 'schedules',
      id: '<someScheduleId>',
      attributes: {
        startAt: Date,
        price: Number
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>'
      }
    },
    {
      type: 'rooms',
      id: '<someRoomId>',
      attributes: {
        title: String,
        rows: Number,
        columns: Number
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>'
      }
    },
    {
      type: 'seats',
      id: '<someSeatId>',
      attributes: {
        number: Number,
        row: Number,
        column: Number,
        available: Boolean
      },
      links: {
        self: '/rest/v1/movies/<someMovieId>/schedules/<someScheduleId>/rooms/<someRoomId>/seats/<someSeatId>'
      }
    }
  ]
}
```
