/**
 * Sources objects from a js singleton.
 *
 * This source allows to inject manually singletons as dependencies
 *
 * This typically allows to override specific modules for testing purposes
 *
 * Examples:
 *
 *    IoC.use(IoC.singleton('settings', {foo : 'bar'}));
 *
 * @param {string} id - the name of the component
 * @param {any} sglt - the singleton that is injected
 * @return {function}
 * @public
 */
module.exports = function(id, sglt) {
	return function app(idLocal){
		if (idLocal === id) {
			const singleton = Promise.resolve(sglt);
			singleton['@singleton'] = true;
			return singleton;
		}	
	}
};
