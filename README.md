connect-mock-rest
==============

Mock rest API middleware for Connect.js. Turns any json file in to a rest API.

When using this middleware `GET`, `POST`, `PUT`, `PATCH` and `DELETE` can be performed on any json file. This is useful for rapidly prototyping an application using only json files as endpoints. 

This module works particularly nice when combined with my fork of TJ's `serve` which can be found [here](). 

At the moment it's only tested with connect 2.3.x because that is what serve uses.

## Setup

    $ npm install body-parser
    $ npm install connect-mock-rest
    
## Connect.js/Express.js Usage

    var mockRest = require('connect-mock-rest')
      , bodyParser = require('body-parser');

    app.use(bodyParser());
    app.use(mockRest());
 