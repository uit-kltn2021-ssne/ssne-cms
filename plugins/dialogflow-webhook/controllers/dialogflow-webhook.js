"use strict";

const matchIntent = require("../services/matchIntent");

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
    var handler = matchIntent(intent);
    return await handler(params);
  },
};
