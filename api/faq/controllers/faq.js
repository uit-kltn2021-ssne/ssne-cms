"use strict";
const moment = require('moment');

// const { AsyncParser } = require("json2csv");
// const { sanitizeEntity } = require("strapi-utils");
const dialogflow = require("@google-cloud/dialogflow");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
async function deleteFaqIntents(intentsClient, agentPath) {
  //const intentsClient = new dialogflow.IntentsClient();
  const listIntentRequest = {
    parent: agentPath
  }
  const intents = await intentsClient.listIntents(listIntentRequest);
  intents[0].forEach((intent) => {
    if (intent.displayName.includes("FAQ_")) {
      intentsClient.deleteIntent({ name: intent.name });
    }
  })
}

module.exports = {
  syncFaqs: async (ctx) => {
    // Instantiate a DialogFlow Documents client.
    const faqs = await strapi.services.faq.find();
    const intentsClient = new dialogflow.IntentsClient();
    const agentPath = intentsClient.agentPath("employee-support-system");
    await deleteFaqIntents(intentsClient, agentPath);
    faqs.forEach(async (faq) => {
      const trainingPhrasesParts = [faq.question];
      const messageTexts = [faq.answer];
      const displayName = "FAQ_" + faq.id + moment().format('MMDDYYYYHHmmss');

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
    });

    return faqs;
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
