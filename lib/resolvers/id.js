/**
 * ID resolver.
 *
 * Resolves object identifiers.  The identifier is resolved to itself, allowing
 * `@require` annotations to directly declare required objects by ID.
 * Identifers must consist solely of alpha-numeric characters, as well as "." or
 * "_" or "-" characters.
 *
 * This is the only resolver built into Electrolyte.  It is expected that
 * higher-level frameworks will add support for resolving interfaces to
 * objects.  Such extensions should mandate the use of a character that is
 * otherwise not valid in an identifer, in order to disambiguate.  For example,
 * this can be done by using URLs, which must include a ":" character.
 *
 * @return {function}
 * @public
 */
module.exports = function() {
  
  return function(id) {
    if (/^[\w\-\.\/]+$/.test(id)) {
      return id;
    }
  };
};
