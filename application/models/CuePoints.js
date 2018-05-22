 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var CuePointsSchema = new mongooseSchema({
     videoType: {
         type: String,
         required: true,
         validate: [stringNotNull, 'videoType is required']
     },
     'lessThanFiveMins': {
         preRoll: {
             type: Boolean,
             default: false
         },
         postRoll: {
             type: Boolean,
             default: false
         },
         midRoll: {
             type: Boolean,
             default: false
         },
         midRollValue: {
             type: Number,
             default: 0
         }
     },
     'fiveToTenMins': {
         preRoll: {
             type: Boolean,
             default: false
         },
         postRoll: {
             type: Boolean,
             default: false
         },
         midRoll: {
             type: Boolean,
             default: false
         },
         midRollValue: {
             type: Number,
             default: 0
         }
     },
     'tenToTwentyMins': {
         preRoll: {
             type: Boolean,
             default: false
         },
         postRoll: {
             type: Boolean,
             default: false
         },
         midRoll: {
             type: Boolean,
             default: false
         },
         midRollValue: {
             type: Number,
             default: 0
         }
     },
     'twentyToThirtyMins': {
         preRoll: {
             type: Boolean,
             default: false
         },
         postRoll: {
             type: Boolean,
             default: false
         },
         midRoll: {
             type: Boolean,
             default: false
         },
         midRollValue: {
             type: Number,
             default: 0
         }
     },
     'thirtyToSixtyMins': {
         preRoll: {
             type: Boolean,
             default: false
         },
         postRoll: {
             type: Boolean,
             default: false
         },
         midRoll: {
             type: Boolean,
             default: false
         },
         midRollValue: {
             type: Number,
             default: 0
         }
     },
     'sixtyAndAboveMins': {
         preRoll: {
             type: Boolean,
             default: false
         },
         postRoll: {
             type: Boolean,
             default: false
         },
         midRoll: {
             type: Boolean,
             default: false
         },
         midRollValue: {
             type: Number,
             default: 0
         }
     }
 });


 CuePointsSchema.plugin(timestamps);
 CuePointsSchema.plugin(softDelete);

 function stringNotNull(obj) {
     return obj.length
 }
 var CuePoints = mongoose.model('CuePoints', CuePointsSchema);
 module.exports = CuePoints
