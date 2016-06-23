var IoC = require('electrolyte');

/**
 * Initialize IoC container.
 *
 * The IoC loader needs to be configured with the location where components
 * are found.  In this case, components are split accross two directories.
 *
 * Route handlers are implemented as components, and located in `app/handlers`.
 *
 * All other components (including database connections, logging facilities,
 * etc.) are located in `app/components`.
 */
IoC.use(IoC.dir('app'));
IoC.use(IoC.dir('app/components'));
IoC.use(IoC.node_modules());
IoC.createAsync('app').then(function () {
  console.log('It\'s alive!!');
});
