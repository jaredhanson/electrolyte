const SuperError = require('super-error');
/**
 * `SpecNotFound` error.
 *
 * @api public
 */
const SpecNotFoundError = SuperError.subclass('SpecNotFoundError', {
    code: 'SPEC_NOT_FOUND'
});

/**
 * Expose `SpecNotFoundError`.
 */
module.exports = SpecNotFoundError;
