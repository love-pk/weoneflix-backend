/**
 configuration is define to make connection with the database for the different environment.
*/

var getDbConnection = function() {
    switch (process.env.NODE_ENV) {
        case 'development':
            var db = mongoose.connect('mongodb://localhost:27017/woohooflix'); //Local

            return checkMongooseConnection(db)
        case 'staging':
            console.log("process.env.NODE_ENV staging= ", process.env.NODE_ENV);
            //var db = mongoose.connect('mongodb://woohooflixappdb:woohooflixappdb1!@ds139665.mlab.com:39665/woohooflix');
            var db = mongoose.connect('mongodb://woohooflix:woohooflix1!@ds153705.mlab.com:53705/woohooflix'); //Development
            //var db = mongoose.connect('mongodb://admin:oodles@localhost:27017/woohooflix');
            return checkMongooseConnection(db)
        case 'production':
            var options = {
                user: 'admin',
                pass: 'ODY1MDJlMzMw'
            };
            var db = mongoose.connect('mongodb://admin:ODY1MDJlMzMw@localhost:27017/woohooflix', options);
            return checkMongooseConnection(db)
        case 'test':
            var db = mongoose.connect('mongodb://woohooflix:woohooflix1!@ds139645.mlab.com:39645/woohooflix');
            //var db = mongoose.connect('mongodb://admin:oodles@localhost:27017/woohooflix');
            return checkMongooseConnection(db)

    }
}

//function to check connection to database server
function checkMongooseConnection(db) {
    mongoose.connection.on('open', function(ref) {
        Logger.info('Connected to mongo server.');
        return db
    });
    mongoose.connection.on('error', function(err) {
        Logger.error('Could not connect to mongo server!');
        Logger.error(err);
    });
}
module.exports.getDbConnection = getDbConnection;
