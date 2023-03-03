const http = require("http");
const dotenv = require("dotenv").config();
const axios = require("axios");

let controllerObj = {};
let commonHelper = require("../common/helper");
let factoryModel = require("../model/factoryModel");

controllerObj.getAllFieldsController = async function (req, res, next) {
  if (req.query.table) {
    let { returnDataFromModel } = await factoryModel.getAllFieldsModel(
      req.query.table
    );
    let returnData = {
      status: true,
      payload: returnDataFromModel,
      code: "FACTORY-ALL-FIELDS-101",
    };
    commonHelper.successHandler(res, returnData);
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-104",
      message: "Please provide a valid table name",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};

controllerObj.permitAll = async function (req, res, next) {
  let returnData = {
    status: true,
    code: "CIA-APP-PERMIT-105",
    payload: false,
  };
  let dataFromModel = await factoryModel.permitAll({
    table: req.body.table,
    list: req.body.checkedData,
  });

  if (dataFromModel !== false) {
    returnData.payload = dataFromModel;
    commonHelper.successHandler(res, returnData);
  } else {
    returnData.status = false;
    returnData.code = "CIA-APP-PERMIT-ERROR-105";
    commonHelper.errorHandler(res, returnData);
  }
};
controllerObj.permitById = async function (req, res, next) {
  let returnData = {
    status: true,
    code: "CIA-APP-PERMIT-106",
    payload: false,
  };
  let dataFromModel = await factoryModel.changePermissionById({
    table: req.body.table,
    id: req.body.id,
  });

  if (dataFromModel !== false) {
    returnData.payload = dataFromModel;
    commonHelper.successHandler(res, returnData);
  } else {
    returnData.status = false;
    returnData.code = "CIA-APP-PERMIT-ERROR-105";
    commonHelper.errorHandler(res, returnData);
  }
};
controllerObj.getDistinctValuesController = async function (req, res, next) {
  if (req.query.table && req.query.column) {
    let returnDataFromModel = await factoryModel.getDistinctValues(
      req.query.column,
      req.query.table
    );
    let returnData = {
      status: true,
      payload: returnDataFromModel,
      code: "FACTORY-DISTINCT-FIELDS-101",
    };
    commonHelper.successHandler(res, returnData);
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-104",
      message: "Please provide a valid table name and column name",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};
controllerObj.updateTableById = async function (req, res, next) {
  const { inputObject, tableName } = req.body;
  const { id } = req.query;
  if (
    !(
      inputObject &&
      Object.keys(inputObject).length === 0 &&
      Object.getPrototypeOf(inputObject) === Object.prototype
    ) &&
    tableName.length > 0
  ) {
    let returnDataFromModel = await factoryModel.updateTable({
      inputObject,
      table: tableName,
      id,
    });
    if (returnDataFromModel === "success") {
      let returnData = {
        status: true,
        payload: returnDataFromModel,
        code: "FACTORY-UPDATE-TABLE-101",
      };
      commonHelper.successHandler(res, returnData);
    } else {
      let finalData = {
        status: false,
        code: "CIP-FACTORY-ERR-105",
        message: "INTERNAL SERVER ERROR",
        payload: [],
      };
      commonHelper.errorHandler(res, finalData, 400);
    }
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-106",
      message: "Please provide a valid table name and input object",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};
controllerObj.updateTeleTableById = async function (req, res, next) {
  // console.log(req.body, "---- in request body of update-tele-table");
  const { inputObject, tableName } = req.body;
  const { id } = req.query;
  if (
    !(
      inputObject &&
      Object.keys(inputObject).length === 0 &&
      Object.getPrototypeOf(inputObject) === Object.prototype
    ) &&
    tableName.length > 0
  ) {
    let returnDataFromModel = await factoryModel.updateTeleTable({
      inputObject,
      table: tableName,
      id,
    });
    if (returnDataFromModel === "success") {
      let returnData = {
        status: true,
        payload: returnDataFromModel,
        code: "FACTORY-UPDATE-TABLE-101",
      };
      commonHelper.successHandler(res, returnData);
    } else {
      let finalData = {
        status: false,
        code: "CIP-FACTORY-ERR-105",
        message: "INTERNAL SERVER ERROR",
        payload: [],
      };
      commonHelper.errorHandler(res, finalData, 400);
    }
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-106",
      message: "Please provide a valid table name and input object",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};



controllerObj.addOrRemovePermissionsFromTelecallers = async function (
  req,
  res,
  next
) {
  // console.log(req.body, "---- hi im in multiple assign controller");
  let returnData = {
    status: true,
    code: "CIA-APP-PERMIT-105",
    payload: false,
  };
  let dataFromModel = await factoryModel.assignToMultipleIds({
    ...req.body,
  });


  if (dataFromModel !== false) {
    returnData.payload = dataFromModel;
    commonHelper.successHandler(res, returnData);
  } else {
    returnData.status = false;
    returnData.code = "CIA-APP-PERMIT-ERROR-105";
    commonHelper.errorHandler(res, returnData);
  }
};


/* Assigning permission to a single telecaller. */
controllerObj.addOrRemovePermissionFromSingleTelecaller = async function (
  req,
  res,
  next
) {
  let returnData = {
    status: true,
    code: "CIA-APP-PERMIT-105",
    payload: false,
  };
  // console.log(req.body, "----- hi im in req body");
  let dataFromModel = await factoryModel.assignToSingleId({ ...req.body, });

  if (dataFromModel !== false) {
    returnData.payload = dataFromModel;
    commonHelper.successHandler(res, returnData);
  } else {
    returnData.status = false;
    returnData.code = "CIA-APP-PERMIT-ERROR-105";
    commonHelper.errorHandler(res, returnData);
  }
};

/* A function which is used to reassign permissions from tele callers. */

controllerObj.reassignPermissionsFromTeleCallers = async function (req, res, next) {

  // console.log(req.body,"request body here --------------------");

  let returnData = {
    status: true,
    code: "CIA-APP-REPERMIT-101",
    payload: false,
  };
  let dataFromModel = await factoryModel.reassignToMultipleIds({...req.body});
  if (dataFromModel) {

    returnData.payload = dataFromModel;
    commonHelper.successHandler(res, returnData);

  } else {
    returnData.status = false;
    returnData.code = "CIA-APP-REPERMIT-ERROR-101";
    commonHelper.errorHandler(res, returnData);
  }

}



controllerObj.getApplicationDataById = async (req, res, next) => {
  let returnDataFromModel = await factoryModel.getApplicationDataById(
    parseInt(req.query.id),
    req.query.table
  );
  let returnData = {
    status: true,
    code: "CI-APP-EXISTING-APPLICATION-EDIT-101",
    payload: {
      ...returnDataFromModel,
    },
  };
  commonHelper.successHandler(res, returnData);
};
// Send Status Message
controllerObj.sendStatusSms = async (req, res, next) => {
  // console.log(req.body);
  let { statusObject, tableName, smsCounter, phone, statusId, flowId, templateId } = req.body;
  const { id } = req.query;

  if (
    !(
      statusObject &&
      Object.keys(statusObject).length === 0 &&
      Object.getPrototypeOf(statusObject) === Object.prototype
    ) &&
    tableName.length > 0
  ) {
    const options = {
      method: "POST",
      hostname: "api.msg91.com",
      port: null,
      path: "/api/v5/flow/",
      headers: {
        "authkey": process.env.MSG91_OTP,
        "content-type": "application/json",
      },
    };

    const req = http.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        let smsdata = body.toString();
        let json = JSON.parse(smsdata);
        if (json.type === "success") {
          updateCounter("success");
        } else {
          updateCounter("failed");
        }
      });
    });

    req.write(
      '{\n  "flow_id": "' + flowId + '",\n  "sender": "1307165656686322346",\n  "mobiles": "91' + phone + '", "dlt_template_id": "' + templateId + '"  \n}'
    );
    req.end();

    const updateCounter = async (smsResp) => {
      if (smsResp != "failed") {
        let returnDataFromModel = await factoryModel.updateSmsCounter({
          smsCounter,
          table: tableName,
          id,
        });

        if (returnDataFromModel === "success") {
          let returnData = {
            status: true,
            payload: returnDataFromModel,
            code: "FACTORY-UPDATE-TABLE-101",
          };
          commonHelper.successHandler(res, returnData);
        } else {
          let finalData = {
            status: false,
            code: "CIP-FACTORY-ERR-105",
            message: "INTERNAL SERVER ERROR",
            payload: [],
          };
          commonHelper.errorHandler(res, finalData, 400);
        }
      } else {
        let finalData = {
          status: false,
          code: "CIP-FACTORY-ERR-105",
          message: "ERROR SENDING SMS",
          payload: [],
        };
        commonHelper.errorHandler(res, finalData, 400);
      }
    };
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-106",
      message: "Please provide a valid table name and input object",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};


// Send Status Message
controllerObj.sendStatusSmsIcici = async (req, res, next) => {
  console.log(req.body);
  let { statusObject, tableName, smsCounter, phone, statusId, flowId, templateId } = req.body;
  const { id } = req.query;

  if (
    !(
      statusObject &&
      Object.keys(statusObject).length === 0 &&
      Object.getPrototypeOf(statusObject) === Object.prototype
    ) &&
    tableName.length > 0
  ) {
    console.log("\n\n\n\n\n");
    const options = {
      method: "POST",
      hostname: "api.msg91.com",
      port: null,
      path: "/api/v5/flow/",
      headers: {
        "authkey": process.env.MSG91_OTP,
        "content-type": "application/json",
      },
    };

    const req = http.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        let smsdata = body.toString();
        let json = JSON.parse(smsdata);
        if (json.type === "success") {
          updateCounter("success");
        } else {
          updateCounter("failed");
        }
      });
    });

    req.write('{\n  "flow_id": "' + flowId + '",\n  \"sender\": \"CRDINA\",\n  \"short_url\": 1,\n  "mobiles": "91' + phone + '", "dlt_template_id": "' + templateId + '" \n}');


    req.end();

    const updateCounter = async (smsResp) => {
      if (smsResp != "failed") {
        let returnDataFromModel = await factoryModel.updateSmsCounterIcici({
          smsCounter,

          id,
        });

        if (returnDataFromModel === "success") {
          let returnData = {
            status: true,
            payload: returnDataFromModel,
            code: "FACTORY-UPDATE-TABLE-101",
          };
          commonHelper.successHandler(res, returnData);
        } else {
          let finalData = {
            status: false,
            code: "CIP-FACTORY-ERR-105",
            message: "INTERNAL SERVER ERROR",
            payload: [],
          };
          commonHelper.errorHandler(res, finalData, 400);
        }
      } else {
        let finalData = {
          status: false,
          code: "CIP-FACTORY-ERR-105",
          message: "ERROR SENDING SMS",
          payload: [],
        };
        commonHelper.errorHandler(res, finalData, 400);
      }
    };
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-106",
      message: "Please provide a valid table name and input object",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};

// Controller to Add Sms Template
controllerObj.addSmsTemplate = async (req, res, next) => {
  const {
    issuer_id,
    bank_name,
    sms_status,
    flow_id,
    template_id,
    sms_template,
  } = req.body;
  if (
    issuer_id.length > 0 &&
    bank_name.length > 0 &&
    sms_status.length > 0 &&
    flow_id.length > 0 &&
    template_id.length > 0 &&
    sms_template.length
  ) {
    let returnDataFromModel = await factoryModel.addSmsTemplate({
      issuer_id,
      bank_name,
      sms_status,
      flow_id,
      template_id,
      sms_template,
    });
    if (returnDataFromModel === "success") {
      let returnData = {
        status: true,
        payload: returnDataFromModel,
        code: "FACTORY-UPDATE-TABLE-101",
      };
      commonHelper.successHandler(res, returnData);
    } else {
      let finalData = {
        status: false,
        code: "CIP-FACTORY-ERR-105",
        message: "INTERNAL SERVER ERROR",
        payload: [],
      };
      commonHelper.errorHandler(res, finalData, 400);
    }
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-106",
      message: "Invalid Request",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};

// Controller to Edit Sms Template
controllerObj.editSmsTemplate = async (req, res, next) => {
  // console.log(req.body)
  const {
    id,
    sms_status,
    flow_id,
    template_id,
    sms_template,
  } = req.body;
  if (
    id.length > 0 &&
    sms_status.length > 0 &&
    flow_id.length > 0 &&
    template_id.length > 0 &&
    sms_template.length > 0
  ) {
    let returnDataFromModel = await factoryModel.editSmsTemplate({
      id,
      sms_status,
      flow_id,
      template_id,
      sms_template,
    });
    if (returnDataFromModel === "success") {
      let returnData = {
        status: true,
        payload: returnDataFromModel,
        code: "FACTORY-UPDATE-TABLE-101",
      };
      commonHelper.successHandler(res, returnData);
    } else {
      let finalData = {
        status: false,
        code: "CIP-FACTORY-ERR-105",
        message: "INTERNAL SERVER ERROR",
        payload: [],
      };
      commonHelper.errorHandler(res, finalData, 400);
    }
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-106",
      message: "Invalid Request",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};

// Controller to Delete Sms Templates
controllerObj.deleteSmsTemplate = async (req, res, next) => {
  // console.log(req.body)
  const {
    id
  } = req.body;
  if (
    id.length > 0
  ) {
    let returnDataFromModel = await factoryModel.deleteSmsTemplate({ id });
    if (returnDataFromModel === "success") {
      let returnData = {
        status: true,
        payload: returnDataFromModel,
        code: "FACTORY-UPDATE-TABLE-101",
      };
      commonHelper.successHandler(res, returnData);
    } else {
      let finalData = {
        status: false,
        code: "CIP-FACTORY-ERR-105",
        message: "INTERNAL SERVER ERROR",
        payload: [],
      };
      commonHelper.errorHandler(res, finalData, 400);
    }
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-106",
      message: "Invalid Request",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};

// Controller to Get Sms Templates
controllerObj.getSmsTemplate = async (req, res, next) => {
  const { issuer_id } = req.body;
  if (req.body) {
    let returnDataFromModel = await factoryModel.getSmsTemplate({
      issuer_id,
    });
    if (returnDataFromModel) {
      let returnData = {
        status: true,
        payload: returnDataFromModel,
        code: "FACTORY-UPDATE-TABLE-101",
      };
      commonHelper.successHandler(res, returnData);
    } else {
      let finalData = {
        status: false,
        code: "CIP-FACTORY-ERR-105",
        message: "INTERNAL SERVER ERROR",
        payload: [],
      };
      commonHelper.errorHandler(res, finalData, 400);
    }
  } else {
    let finalData = {
      status: false,
      code: "CIP-FACTORY-ERR-106",
      message: "Invalid Request",
      payload: [],
    };
    commonHelper.errorHandler(res, finalData, 400);
  }
};

// Controller to Get Current User
controllerObj.getUser = async (req, res, next) => {

  let userdata = jwt.decode(req.session.userToken);
  let punchInStatus = await factoryModel.getPunchInStatus(userdata.ua_id);
  userdata = { ...userdata, punchInStatus };

  res.status(200).json(userdata)
}

// Controller to Get Current User
controllerObj.dailyPunchIn = async (req, res, next) => {

  let userdata = jwt.decode(req.session.userToken);
  let punchInStatus = await factoryModel.updatePunchInStatus(userdata.ua_id, req.body.status);

  if (punchInStatus) {
    res.status(200).json(punchInStatus)
  } else {
    res.status(500).json({
      message: "error sending message"
    })
  }

}

module.exports = controllerObj;
