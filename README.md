connect-mock-rest
==============

Mock rest API middleware for connect. It turns any json file in to a rest API.

When using this middleware `GET`, `POST`, `PUT`, `PATCH` and `DELETE` can be performed on any json file. This is useful for rapidly prototyping an application using only json files as endpoints. 

This module works particularly nice when combined with my fork of [TJ](https://github.com/tj)'s [serve](https://github.com/tj/serve) which can be found [here](https://github.com/OrganicPanda/serve). 

At the moment it's only tested with connect 2.3.x because that is what serve uses.

## Setup
```shell
$ npm install connect@2.3.x
$ npm install body-parser
$ npm install connect-mock-rest
```
    
## Usage
```js
var connect = require('connect')
  , mockRest = require('connect-mock-rest')
  , bodyParser = require('body-parser');

var server = connect();

server.use(bodyParser());
server.use(mockRest());
```

Create a json file containing an array. In this example `/foo.json` contains `[]`. Start your server and then:

```shell
$ curl http://localhost:3000/foo.json
[]

$ curl -H "Content-Type: application/json" -X POST -d '{"name":"steve"}' http://localhost:3000/foo.json
{"name":"steve","id":"29b6ae06-87ec-422c-9efc-ad3c7e759364"}

$ curl http://localhost:3000/foo.json
[{"name":"steve","id":"29b6ae06-87ec-422c-9efc-ad3c7e759364"}]

$ curl -H "Content-Type: application/json" -X PUT -d '{"name":"foo"}' http://localhost:3000/foo.json/29b6ae06-87ec-422c-9efc-ad3c7e759364
{"name":"foo","id":"29b6ae06-87ec-422c-9efc-ad3c7e759364"}

$ curl http://localhost:3000/foo.json
[{"name":"foo","id":"29b6ae06-87ec-422c-9efc-ad3c7e759364"}]

$ curl -H "Content-Type: application/json" -X PATCH -d '{"name":"bar"}' http://localhost:3000/foo.json/29b6ae06-87ec-422c-9efc-ad3c7e759364
{"name":"bar","id":"29b6ae06-87ec-422c-9efc-ad3c7e759364"}

$ curl http://localhost:3000/foo.json
[{"name":"bar","id":"29b6ae06-87ec-422c-9efc-ad3c7e759364"}]

$ curl http://localhost:3000/foo.json/29b6ae06-87ec-422c-9efc-ad3c7e759364
{"name":"bar","id":"29b6ae06-87ec-422c-9efc-ad3c7e759364"}

$ curl -X DELETE http://localhost:3000/foo.json/29b6ae06-87ec-422c-9efc-ad3c7e759364
{"name":"bar","id":"29b6ae06-87ec-422c-9efc-ad3c7e759364"}

$ curl http://localhost:3000/foo.json
[]
```

## Things to note

 - This is intended for rapid prototyping purposes only. You would be mad to use this on any real project.
 - Objects are created with a GUID which is stored as `id`. Any existing `id` will be overwritten.
 - Resource nesting is not supported.
 - Security is not considered *at all*.
 - Invalid requests will not be handled well. This thing is far from bulletproof.
 - There is no validation of incoming data.
 - Duplicate objects will be created if the same object is posted twice. 
 - When finding items the first match is returned. This applies to all methods.
 