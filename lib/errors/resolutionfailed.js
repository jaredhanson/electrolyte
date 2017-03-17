const SuperError = require('super-error');
/**
 * `ResolutionFailed` error.
 *
 * @api public
 */
const ResolutionFailedError = SuperError.subclass('ResolutionFailedError', {
    code: 'RESOLUTION_FAILED'
});

/**
 * Expose `ResolutionFailedError`.
 */
module.exports = ResolutionFailedError;
