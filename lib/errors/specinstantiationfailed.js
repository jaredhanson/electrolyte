const SuperError = require('super-error');
/**
 * `SpecInstantiationFailed` error.
 *
 * @api public
 */
const SpecInstantiationFailedError = SuperError.subclass('SpecInstantiationFailedError', {
    code: 'SPEC_INSTANTIATION_FOUND'
});

/**
 * Expose `SpecInstantiationFailedError`.
 */
module.exports = SpecInstantiationFailedError;
