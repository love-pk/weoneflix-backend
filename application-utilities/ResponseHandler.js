
var responseHandler = function(res,responseObject,message,error,status1){
    console.log(responseObject)
    console.log(status1)
	res.status(status1).send({
		"error":error,
		"message":message,
		"response":responseObject
	})
    res.end()
}

module.exports.responseHandler = responseHandler;
