var path = require('path')
  , fs = require('fs');

var identityKey = 'id';

var findById = function(items, id) {
  // Takes the first one it finds
  return items.filter(function(item) {
    return item && String(item[identityKey]) === id;
  })[0] || null;
};

var notFound = function(req, res, next) {
  res.statusCode = 404;

  return next('Not Found');
};

var idRequired = function(req, res, next) {
  res.statusCode = 400;

  return next('Bad Request');
};

var readJson = function(file, cb) {
  fs.readFile(file, 'utf8', function(err, str) {
    if (err) return cb(err);

    var parsed;

    try {
      parsed = JSON.parse(str);
    } catch(e) {
      cb(e);
    }

    cb(null, parsed);
  });
};

var writeJson = function(file, content, cb) {
  var stringified;

  try {
    stringified = JSON.stringify(content);
  } catch(e) {
    cb(e);
  }

  fs.writeFile(file, stringified, function(err) {
    if (err) cb(err);

    cb(null, stringified);
  });
};

var returnJson = function(res, content) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(content));
};

// From: http://stackoverflow.com/a/2117523/178959
var generateId = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16|0
      , v = (c === 'x') ? r : (r&0x3|0x8);

    return v.toString(16);
  });
};

var putJson = function(fsPath, id, req, res, next) {
  var posted = req.body;

  readJson(fsPath, function(err, parsed) {
    if (err) return next(err);

    var found = findById(parsed, id);

    if (!found) return notFound(req, res, next);

    Object.keys(posted).forEach(function(key) {
      found[key] = posted[key];
    });

    writeJson(fsPath, parsed, function(err, stringified) {
      if (err) return next(err);

      returnJson(res, found);
    });
  });
};

var deleteJson = function(fsPath, id, req, res, next) {
  var posted = req.body;

  readJson(fsPath, function(err, parsed) {
    if (err) return next(err);

    var found = findById(parsed, id);

    if (!found) return notFound(req, res, next);

    parsed.splice(parsed.indexOf(found), 1);

    writeJson(fsPath, parsed, function(err, stringified) {
      if (err) return next(err);

      returnJson(res, found);
    });
  });
};

var postJson = function(fsPath, req, res, next) {
  var posted = req.body;

  readJson(fsPath, function(err, parsed) {
    if (err) return next(err);

    posted[identityKey] = generateId();
    parsed.push(posted);

    writeJson(fsPath, parsed, function(err, stringified) {
      if (err) return next(err);

      returnJson(res, posted);
    });
  });
};

var getListJson = function(fsPath, req, res, next) {
  readJson(fsPath, function(err, parsed) {
    if (err) return next(err);

    returnJson(res, parsed);
  });
};

var getJson = function(fsPath, id, req, res, next) {
  readJson(fsPath, function(err, parsed) {
    if (err) return next(err);

    var found = findById(parsed, id);

    if (!found) return notFound(req, res, next);

    returnJson(res, found);
  });
};

module.exports = function(basePath) {
  basePath = basePath || path.resolve('.');

  return function(req, res, next) {
    // See if we have:
    // /blah.json
    // /foo/blah.json
    // /foo/blah.json/
    // /foo/blah.json/superid
    var match = req.url.match(/(\/.+\.json)(?:$|\/($|[^\/\s]+$))/i);

    if (!match) return next();

    var file = match[1]
      , id = match[2]
      , idValid = (id !== undefined && id !== '')
      , fsPath = path.join(basePath, file);

    // Make serve/connect ignore the id and slash if they were there
    req.url = file;

    switch(req.method) {
      case 'GET':
        if (idValid) return getJson(fsPath, id, req, res, next);

        return getListJson(fsPath, req, res, next);

        break;

      case 'PUT':
      case 'PATCH':
        if (!idValid) return idRequired(req, res, next);

        return putJson(fsPath, id, req, res, next);

        break;

      case 'POST':
        return postJson(fsPath, req, res, next);

        break;

      case 'DELETE':
        if (!idValid) return idRequired(req, res, next);

        return deleteJson(fsPath, id, req, res, next);

        break;
    }
  };
};
