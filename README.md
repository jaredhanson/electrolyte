# Electrolyte

[![Build](https://img.shields.io/travis/jaredhanson/electrolyte.svg)](https://travis-ci.org/jaredhanson/electrolyte)
[![Coverage](https://img.shields.io/coveralls/jaredhanson/electrolyte.svg)](https://coveralls.io/r/jaredhanson/electrolyte)
[![Quality](https://img.shields.io/codeclimate/github/jaredhanson/electrolyte.svg?label=quality)](https://codeclimate.com/github/jaredhanson/electrolyte)
[![Dependencies](https://img.shields.io/david/jaredhanson/electrolyte.svg)](https://david-dm.org/jaredhanson/electrolyte)


Electrolyte is a simple, lightweight [inversion of control](http://en.wikipedia.org/wiki/Inversion_of_control)
(IoC) container for Node.js applications.

Electrolyte automatically wires together the various components and services
needed by an application.  It does this using a technique known as
[dependency injection](http://en.wikipedia.org/wiki/Dependency_injection) (DI).
Using Electrolyte eliminates boilerplate code and improves software quality by
encouraging loose coupling between modules, resulting in greater reusability and
increased test coverage.

For further details about the software architecture used for IoC and dependency
injection, refer to [Inversion of Control Containers and the Dependency Injection pattern](http://martinfowler.com/articles/injection.html)
by [Martin Fowler](http://martinfowler.com/).

## Install

    $ npm install electrolyte

## Usage

There are two important terms to understand when using Electrolyte:
components and annotations.

#### Components

Components are simply modules which return objects used within an application.
For instance, a typical web application might need a place to store settings, a
database connection, and a logging facility.

Here's a component that initializes settings:

```javascript
exports = module.exports = function() {
  var settings = {}
    , env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      settings.dbHost = 'sql.example.com';
      settings.dbPort = 3306;
      break;
    default:
      settings.dbHost = '127.0.0.1';
      settings.dbPort = 3306;
      break;
  }

  return settings;
}

exports['@singleton'] = true;
```

Pretty simple.  A component exports a "factory" function, which is used to
create and initialize an object.  In this case, it just sets a couple options
depending on the environment.

What about `exports['@singleton']`?  That's an annotation, and we'll return to
that in a moment.


Here's another component that initializes a database connection (saved as 'database.js'):

```javascript
var mysql = require('mysql');

exports = module.exports = function(settings) {
  var connection = mysql.createConnection({
    host: settings.dbHost,
    port: settings.dbPort
  });

  connection.connect(function(err) {
    if (err) { throw err; }
  });

  return connection;
}

exports['@singleton'] = true;
exports['@require'] = [ 'settings' ];
```

Also very simple.  A function is exported which creates a database connection.
And those annotations appear again.

#### Async Components

Async components are defined in an identical manner to traditional components
except that the factory function should return a promise. An additional annotation
is used to signify that the dependency should be treated as asynchronous.

Let's rewrite the database component above slightly to return a promise.

```javascript
var mysql = require('mysql');

exports = module.exports = function(settings) {
  return mysql.connectAsPromise({
    host: settings.dbHost,
    port: settings.dbPort
  }).then(function (conn) {
    // do something clever
    return conn;
  });
}

exports['@async'] = true;
exports['@singleton'] = true;
exports['@require'] = [ 'settings' ];
```

Let's also define a users model that relies on the database component (saved as `users.js`).

```javascript
exports = module.exports = function(database) {
  return {
    create: function (name, email, password) {
      return database.execute('INSERT INTO users ...');
    }
  };
}

exports['@async'] = true;
exports['@singleton'] = true;
exports['@require'] = [ 'database' ];
```

#### Annotations

Annotations provide an extra bit of metadata about the component, which
Electrolyte uses to automatically wire together an application.

- `@require`  Declares an array of dependencies needed by the component.  These
   dependencies are automatically created and injected as arguments (in the same
   order as listed in the array) to the exported function.

- `@singleton`  Indicates that the component returns a singleton object, which
  should be shared by all components in the application.

- `@async`  Indicates that the component returns a promise OR depends on a
  component that is computed asynchronously. An async component can only be created
  using the `.createAsync` method. Attempting to create an async component using
  the standard `.create` will throw an exception.

#### Creating Components

Components are created by asking the IoC container to create them:

```javascript
var IoC = require('electrolyte');

var db = IoC.create('database');
```

Electrolyte is smart enough to automatically traverse a component's dependencies
(and dependencies of dependencies, and so on), correctly wiring together the
complete object structure.

In the case of the database above, Electrolyte would first initialize the
`settings` component, and pass the result as an argument to the `database`
component.  The database connection would then be returned from `IoC.create`.

This automatic instantiation and injection of components eliminates the
boilerplate plumbing many application need for initialization.

#### Creating Async Components

Again, components are created by asking the IoC container to create them:

```javascript
var IoC = require('electrolyte');

var usersPromise = IoC.createAsync('users');

usersPromise.then(function (users) {
  ...
});
```

Here as well electrolyte is smart enough to automatically traverse a component's
dependencies, correctly wiring together the complete object structure and waiting
for each promise to resolve along the way.

In the case of the users model above, Electrolyte would first initialize the
`settings` component, and pass the result as an argument to the `database`
component. Electrolyte would then wait for the database connection promise to
resolve before passing the resulting value to the users component. `IoC.createAsync`
then returns a promise that resolves to the object defined by the users component
after the all of its dependencies resolve.

#### Configure the Loader

When a component is `@require`'d by another component, Electrolyte will
automatically load and instantiate it.  The loader needs to be configured with
location where an application's components are found:

```javascript
IoC.use(IoC.dir('app/components'));
```

#### @require vs require()

Loading components is similar in many regards to `require`ing a module, with
one primary difference: components have the ability to return an object that
is configured according to application-level or environment-specific settings.
Traditional modules, in contrast, assume very little about the runtime
configuration of an application and export common, reusable bundles of
functionality.

Using the strengths of each approach yields a nicely layered architecture, which
can be seen in the database component above.  The `mysql` module provides
reusable functionality for communicating with MySQL databases.  The database
component provides a _configured instance_ created from that module that
connects to a specific database.

This pattern is common: modules are `require()`'d, and object instances created
from those modules are `@require`'d.

There are scenarios in which this line can blur, and it becomes desireable to
inject modules themselves.  This is typical with modules that provide
network-related functionality that needs to be mocked out in test environments.

Electrolyte can be configured to do this automatically, by configuring the loader
to inject modules:

```javascript
IoC.use(IoC.node_modules());
````

With that in place, the database component above can be re-written as follows:

```javascript
exports = module.exports = function(mysql, settings) {
  var connection = mysql.createConnection({
    host: settings.dbHost,
    port: settings.dbPort
  });

  connection.connect(function(err) {
    if (err) { throw err; }
  });

  return connection;
}

exports['@singleton'] = true;
exports['@require'] = [ 'mysql', 'settings' ];
```

Note that now the `mysql` module is injected by Electrolyte, rather than
explicitly `require()`'d.  This makes it easy to write tests for this component
while mocking out network access entirely.

## Examples

- __[Express](https://github.com/jaredhanson/electrolyte/tree/master/examples/express)__
  An example Express app using IoC to create routes, with necessary components.

- __[Async Express](https://github.com/jaredhanson/electrolyte/tree/master/examples/async-express)__
  An example Express app using IoC to create routes asynchronously, with necessary components.

## Tests

    $ npm install
    $ npm test

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)
  - Atomic by Cengiz SARI from The Noun Project
  - [Colour palette](http://www.colourlovers.com/palette/912371/Electrolytes)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
