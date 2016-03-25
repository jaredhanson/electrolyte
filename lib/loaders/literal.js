/**
 * Returns a component definition which will, when queried with the
 * provided componentId, return the provided literal component.
 *
 * @param componentId The identifier for the provided component
 * @param component The literal component to be added
 * @returns {Function} To return the provided component when the appropriate
 * component id is specified.
 */
module.exports = function (componentId, component) {

    return function (id) {
        return (componentId == id) ? component : null;
    };

};
