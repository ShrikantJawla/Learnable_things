const axios = require('axios').default;

  let externalApiObj = {};

/* Hitting external api. */
  externalApiObj.hitExternalApibeddlyingdrahomach = async function (dataToHit) {

	//console.log(dataToHit, "dataToHit");
	let consoleData = {};
	consoleData.totalData = dataToHit.length;
	consoleData.sucessData = 0;
	consoleData.failData  = 0;
	
	for(let i = 0; i < dataToHit.length; i++){

		//console.log(axios(`https://beddlyingdrahomach.com/postback?cid=${dataToHit[i].trackingId}&et=${dataToHit[i].lead}`));
		axios.get('https://beddlyingdrahomach.com/postback', {
			params: {
				cid: dataToHit[i].trackingId,
				et: dataToHit[i].lead,

			}
		  })
		  .then(function (response) {
			//console.log(dataToHit[i]);
			consoleData.sucessData++;
			// console.log(response);
			console.log('OK ' , consoleData);
		  })
		  .catch(function (error) {
			//console.log(dataToHit[i]);
			consoleData.failData++;
			console.log( "error while hitting external api" , consoleData);
		  })
		  .finally(function () {
			//console.log(dataToHit[i]);
			//console.log("finally api hitted");
		  });
	}

	//console.log(consoleData , "consoleDataconsoleDataconsoleData");


  }


  module.exports = externalApiObj;