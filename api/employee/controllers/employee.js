'use strict';
const dialogflow = require("@google-cloud/dialogflow");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
 var combine = function(a, min) {
    var fn = function(n, src, got, all) {
        if (n == 0) {
            if (got.length > 0) {
                all[all.length] = got;
            }
            return;
        }
        for (var j = 0; j < src.length; j++) {
            fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
        }
        return;
    }
    var all = [];
    for (var i = min; i < a.length; i++) {
        fn(i, a, [], all);
    }
    all.push(a);
    return all;
}

module.exports = {
    syncEntities: async (ctx) => {
        // Instantiate a DialogFlow Documents client.
    
        const entityTypesClient = new dialogflow.EntityTypesClient();
        //const agentPath = entityTypesClient.agentPath("employee-support-system");
        const entityTypePath = entityTypesClient.entityTypePath("employee-support-system", "77600171-27e9-4cdc-a28a-482851cef0db")
        let entityList = [];

        const employees = await strapi.services.employee.find();

        employees.forEach(element => {
            const entity = {
                value: element.name ,
                synonyms: combine(element.name.split(" "), 1)
            }
            entityList.push(entity);
        });

        const entityType = {
            displayName: "nhan_vien",
            kind: "KIND_MAP",
            name: entityTypePath,
            entities: entityList
        }

        const updateIntentRequest = {
          entityType: entityType,
          languageCode: "en"
        };
    
        // Update the entityType
        const [response] = await entityTypesClient.updateEntityType(updateIntentRequest)
        //console.log(`Intent ${response.name} created`);
        return response;
      },
};
