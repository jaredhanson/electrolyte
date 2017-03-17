const SuperError = require('super-error');
/**
 * `NotImplemented` error.
 *
 * @api public
 */
const NotImplementedError = SuperError.subclass('NotImplemented', {
    code: 'NOT_IMPLEMENTED'
});

/**
 * Expose `NotImplementedError`.
 */
module.exports = NotImplementedError;
