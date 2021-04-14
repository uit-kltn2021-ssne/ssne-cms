"use strict";

var buildMessage = (employee) => {
  let message;
  const {
    name,
    employeeId,
    department,
    phoneNumber,
    email,
    skypeId,
    facebook,
  } = employee;
  if (name) {
    message = "";
    message += `Đây là thông tin bạn cần tìm:\n ${name}`;
    if (employeeId) message += ` (${employeeId})\n`;
    if (department.name) message += `${department.name}`;
    if (phoneNumber) message += `\nSĐT: ${phoneNumber}`;
    if (email) message += `\nEmail: ${email}`;
    if (skypeId) message += `\nSkype: ${skypeId}`;
    if (facebook) message += `\nFacebook: ${facebook}`;
  }
  return message;
};

module.exports = async (params) => {
  let message;
  let employeeName = params.nhan_vien;
  let m = {
    name: { $regex: employeeName, $options: "i" },
  };
  let res = await strapi.services.employee.findOne(m, ["department"]);
  if (res) message = buildMessage(res);
  return {
    fulfillmentMessages: [
      {
        text: {
          text: [message],
        },
      },
    ],
  };
};
