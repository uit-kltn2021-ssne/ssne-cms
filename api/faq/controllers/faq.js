"use strict";

const { AsyncParser } = require("json2csv");
const { sanitizeEntity } = require("strapi-utils");
const dialogflow = require("@google-cloud/dialogflow");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  syncFaqs: async (ctx) => {
    // Instantiate a DialogFlow Documents client.
    const trainingPhrasesParts = ["How many people are staying?"];
    const messageTexts = ["Your reservation has been confirmed"];
    const displayName = "MAKE_RESERVATION";

    const intentsClient = new dialogflow.IntentsClient();
    const agentPath = intentsClient.agentPath("employee-support-system");

    const trainingPhrases = [];

    trainingPhrasesParts.forEach((trainingPhrasesPart) => {
      const part = {
        text: trainingPhrasesPart,
      };

      // Here we create a new training phrase for each provided part.
      const trainingPhrase = {
        type: "EXAMPLE",
        parts: [part],
      };

      trainingPhrases.push(trainingPhrase);
    });
    const messageText = {
      text: messageTexts,
    };

    const message = {
      text: messageText,
    };

    const intent = {
      displayName: displayName,
      trainingPhrases: trainingPhrases,
      messages: [message],
    };

    const createIntentRequest = {
      parent: agentPath,
      intent: intent,
    };

    // Create the intent
    const [response] = await intentsClient.createIntent(createIntentRequest);
    console.log(`Intent ${response.name} created`);
    return response;
  },

  getCsv: async (ctx) => {
    const fields = ["question", "answer"];
    const opts = { fields };
    const transformOpts = { highWaterMark: 8192 };

    const asyncParser = new AsyncParser(opts, transformOpts);

    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.faq.search(ctx.query);
    } else {
      entities = await strapi.services.faq.find(ctx.query);
    }

    asyncParser.input.push(JSON.stringify(entities));
    asyncParser.input.push(null);

    ctx.type = "text/csv";

    let csv = await asyncParser.promise(true);
    return csv;
  },
};
