module.exports = function (componentId, component) {

    return function (id) {
        return (componentId == id) ? component : null;
    };

};
