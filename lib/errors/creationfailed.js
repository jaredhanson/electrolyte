const SuperError = require('super-error');
/**
 * `CreationFailed` error.
 *
 * @api public
 */
const CreationFailedError = SuperError.subclass('CreationFailedError', {
    code: 'CREATION_FAILED'
});

/**
 * Expose `CreationFailedError`.
 */
module.exports = CreationFailedError;
