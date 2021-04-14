"use strict";

const employeeInfo = require("./intent-services/employeeInfo");

const serviceIntents = {
    tim_thong_tin_nhan_vien: employeeInfo
};

module.exports = (intentName) => {
    return serviceIntents[intentName];
}