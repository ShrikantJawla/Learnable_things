let ciFormModel = require('../apiModels/ciFormModel');

//////////////////////////////

let controllerObj = {};

controllerObj.postFormData = async function(req,res,next){
	//console.log("ci-form route", req.body);
	//console.log(req.headers);
	if(req.headers['apikey'] == "4a12cbdf9581a060fc47d3dcb94f3901b1129b5aeb90c024d851b15666b7d01b"){
		if(req.body && req.body.ci_phone && req.body.ci_email && req.body.ci_name, req.body.ci_form_filled , req.body.ci_device){

			//console.log("api key is valid");
			let dataFromDb = await ciFormModel.postDataFromFormIntoDb(req.body);
			//console.log(dataFromDb, "dsddsu");
			if(dataFromDb){

				res.send({data: "success"});
				
			}else{
				res.send({data: "fail"});
			}
			
		}else{
			res.send({data: "Not valid"});
		}

	} else {
		res.send({ data: "Please select all the fields" });
	}
}

module.exports = controllerObj;