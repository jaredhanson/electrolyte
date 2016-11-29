var chai = require('chai');

chai.use(require('chai-express-handler'));
chai.use(require('sinon-chai'));

global.expect = chai.expect;
