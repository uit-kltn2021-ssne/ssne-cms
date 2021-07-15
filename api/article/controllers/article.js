'use strict';
const moment = require('moment');
const mdt = require('markdown-tree');
const dialogflow = require("@google-cloud/dialogflow");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
async function deletePostIntents(intentsClient, agentPath) {
    //const intentsClient = new dialogflow.IntentsClient();
    const listIntentRequest = {
        parent: agentPath
    }
    const intents = await intentsClient.listIntents(listIntentRequest);
    intents[0].forEach((intent) => {
        if (intent.displayName.includes("POST_NODE_")) {
            intentsClient.deleteIntent({ name: intent.name });
        }
    })
}

function addToStorage(storage, key1, key2, value) {
    var index = storage.findIndex(x => x.key2 === key2);
    if (index > -1) {
        storage[index].value = storage[index].value + "\n" + value
    } else {
        storage.push({ key1: key1, key2: key2, value: value })
    }
}

function treeTrace(storage, tree, key1 = '', key2 = '', value = '') {
    tree.forEach((node) => {
        if (node.type === "Heading") {
            key1 = node.text;
            key2 = key2 + " " + node.text;
            if (node.children && node.children.length > 0) {
                treeTrace(storage, node.children, key1, key2, value)
            }
            if (node.tokens && node.tokens.length > 0) {
                treeTrace(storage, node.tokens, key1, key2, value)
            }
        }
        if (node.type === "paragraph") {
            value = node.text
            addToStorage(storage, key1.replace(/\.|\*/g, ''), key2.replace(/\.|\*/g, ''), value)
            // console.log({
            //     key: key,
            //     value: value
            // })
        }
    })
}

module.exports = {
    syncArticles: async (ctx) => {
        // Instantiate a DialogFlow Documents client.
        const articles = await strapi.services.article.find();
        const intentsClient = new dialogflow.IntentsClient();
        const agentPath = intentsClient.agentPath("employee-support-system");
        await deletePostIntents(intentsClient, agentPath);
        articles.forEach(async (article) => {
            var treeStorage = [];
            const tree = mdt(article.content);
            treeTrace(treeStorage, tree.children);

            treeStorage.forEach(async (node) => {
                const trainingPhrasesParts = [node.key1, node.key2];
                const messageTexts = [node.value];
                const displayName = "POST_NODE_" + treeStorage.indexOf(node) + '_' + article.id + moment().format('MMDDYYYYHHmmss');
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
            })
            //console.log(treeStorage);
        });

        return articles;
    },
};
