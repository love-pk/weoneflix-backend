var configVariables = function() {
    switch (process.env.NODE_ENV) {
        case 'development':

            var config = {
                port: 3000,
                host: '//localhost:3000/',
                verificationUrl: '//localhost:3000/verify/',
                frontendUrl: '//localhost:7000/#/',
                adminfrontendUrl: '//localhost:7070/angular/#/',
                awsAccessKeyId: '',
                awsSecretAccessKey: '',
                bucketname: '',
                emailFrom: 'admin@woohooflix.com',
                emailPassword: 'woohooflix@6',
                verificationEmailSubject: 'Welcome To OodlesStudio !',
                fbclientID: "561912847331414",
                fbclientSecret: "d872b7d75c84d1224fb5ca55c8e6d96b",
                fbcallbackURL: "//localhost:3000/auth/facebook/callback",
                bannerPath: "//localhost:7000/images/Banner/",
                imagePath: "//localhost:7000/images/img/",
                kalturaPartnerId: 102,
                kalturaUserId: "pawanpreet.singh@oodlestechnologies.com",
                kalturaAdminSecret: "904ce8ec33b1356074eb41d210f97c1d", // <-Main//"61244e1f30722ea45d5f708f9357750f",
                kalturaServerUrl: "http://kalturadev.woohooflix.com/", // <-Main//"http://192.168.2.103/",
                vastXmlURL: "/api/v1/vastgenerator/"
            }
            return config;

        case 'staging':
            var config = {
                port: 3000,
                host: '//localhost:3000/',
                verificationUrl: '//localhost:3000/verify/',

                frontendUrl: '//180.151.230.12:7000/#/',

                adminfrontendUrl: '//localhost:7070/angular/#/',
                
                awsAccessKeyId: '',
                awsSecretAccessKey: '',
                bucketname: '',
                
                emailFrom: 'admin@woohooflix.com',
                emailPassword: 'woohooflix@6',
                
                verificationEmailSubject: 'Welcome To OodlesStudio !',
                
                fbclientID: "555878334601532",
                fbclientSecret: "211ee1892745562a7031d8d6d538bbe1",
                fbcallbackURL: "//180.151.230.12:3000/auth/facebook/callback",

                bannerPath: "//localhost:7000/images/Banner/",
                imagePath: "//localhost:7000/images/img/",
                
                kalturaPartnerId: 101,
                kalturaUserId: "prakhar.budholiya@oodlestechnologies.com",
                kalturaAdminSecret: "27f7eace62147bf6fdd9867effd924e7",
                kalturaServerUrl: "http://kaltura.woohooflix.com/",
                
                vastXmlURL: "/api/v1/vastgenerator/"
            }
            return config;

        case 'production':
            var config = {
                port: 3000,
                host: '//localhost:3000/',
                verificationUrl: '//localhost:3000/verify/',

                frontendUrl: '//52.66.114.239/#!/',

                adminfrontendUrl: 'admin.woohooflix.com',
                awsAccessKeyId: '',
                awsSecretAccessKey: '',
                bucketname: '',
                emailFrom: 'admin@woohooflix.com',
                emailPassword: 'woohooflix@6',
                verificationEmailSubject: 'Welcome To OodlesStudio !',
                fbclientID: "555878334601532",
                fbclientSecret: "211ee1892745562a7031d8d6d538bbe1",
                fbcallbackURL: "//52.66.114.239/auth/facebook/callback",

                bannerPath: "//localhost:7000/images/Banner/",
                imagePath: "//localhost:7000/images/img/",
                kalturaPartnerId: 101,
                kalturaUserId: "prakhar.budholiya@oodlestechnologies.com",
                kalturaAdminSecret: "27f7eace62147bf6fdd9867effd924e7",
                kalturaServerUrl: "http://kaltura.woohooflix.com/",
                vastXmlURL: "/api/v1/vastgenerator/"
            }
            return config;

        case 'test':
            var config = {
                port: 80,
                host: '//localhost:3000/',
                verificationUrl: '//localhost:3000/verify/',
                frontendUrl: '//localhost:9000/#/',
                awsAccessKeyId: '',
                awsSecretAccessKey: '',
                bucketname: '',
                emailFrom: 'woohooflx.oodles@gmail.com',
                emailPassword: 'woohooflix',
                verificationEmailSubject: 'Welcome To OodlesStudio !',
                fbclientID: "555878334601532",
                fbclientSecret: "211ee1892745562a7031d8d6d538bbe1",
                fbcallbackURL: "//localhost:3000/auth/facebook/callback",
                bannerPath: "//localhost:7000/images/Banner/",
                imagePath: "//localhost:7000/images/img/"

            }
            return config;
    }
}
module.exports.configVariables = configVariables;
