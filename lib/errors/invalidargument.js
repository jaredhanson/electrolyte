const SuperError = require('super-error');
/**
 * `InvalidArgument` error.
 *
 * @api public
 */
const InvalidArgumentError = SuperError.subclass('InvalidArgument', {
    code: 'INVALID_ARGUMENT'
});

/**
 * Expose `InvalidArgumentError`.
 */
module.exports = InvalidArgumentError;
