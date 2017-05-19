const SuperError = require('super-error');
/**
 * `SpecInitFailed` error.
 *
 * @api public
 */
const SpecInitFailedError = SuperError.subclass('SpecInitFailedError', {
    code: 'SPEC_INIT_FAILED'
});

/**
 * Expose `SpecInitFailedError`.
 */
module.exports = SpecInitFailedError;
