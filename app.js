/**
 * Module dependencies.
 */
var mongoosemask = require('mongoosemask');
var multer = require('multer')

global.configurationHolder = require('./configurations/DependencyInclude.js');
global.rootPath = __dirname;
global.app = module.exports = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "false");
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers", "Authorization", "Activity-Name", "Auth-Token");
    next();
});
app.use(multer({}));

app.use(bodyParser());
app.use(errorHandler());

global.router = express.Router();
app.use(express.static(__dirname + '/public'));
global.domain = require('./configurations/DomainInclude.js');

app.use(passport.initialize());
app.use(passport.session());
require('./configurations/FacebookAuthentication')();

//removing fields from the response
app.use(mongoosemask(function (result, mask, done) {
    var masked = mask(result, []);
    if (masked.object) {
        masked.object = mask(result.object, ['__v', 'salt', 'password']);
    }
    done(null, masked);
}));

require('./application-utilities/jobs/videoRatingJob.js')();
require('./application-utilities/jobs/videoStatusFromKaltura.js')();
require('./application-utilities/jobs/RemoveTempVideos.js')();
require('./application-utilities/jobs/UpdateChannelAdminRevenue.js')();

Layers = require('./application-utilities/layers').Express;
var wiring = require('./configurations/UrlMapping');
new Layers(app, router, __dirname + '/application/controller-service-layer', wiring);

configurationHolder.Bootstrap.initApp()
