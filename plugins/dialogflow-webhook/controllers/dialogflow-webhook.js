"use strict";

/**
 * dialogflow-webhook.js controller
 *
 * @description: A set of functions called "actions" of the `dialogflow-webhook` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: "ok",
    });
  },

  /**
   * Webhook
   * @return {Object}
   */

  webhook: async (ctx) => {
    let body = ctx.request.body;
    let intent = body.queryResult.intent.displayName;
    let params = body.queryResult.parameters;
    let message;
    if (intent === "tim_thong_tin_nhan_vien") {
      let employeeName = params.nhan_vien;
      let m = {
        name: { $regex: employeeName, $options: "i" },
      };
      let res = await strapi.services.employee.findOne(m, ['department']);
      if (res) {
        message = 'Đây là thông tin bạn cần tìm:\n' + res.name + ' (' + res.employeeId + ')\n' +
                  res.title.name +
                  '\nSĐT: ' + res.phoneNumber +
                  '\nEmail: ' + res.email +
                  '\nSkype: ' + res.skypeId +
                  '\nFacebook: ' + res.facebook;
      }
    }
    return {
      fulfillmentMessages: [
        {
          text: {
            text: [message],
          },
        },
      ],
    };
  },
};
