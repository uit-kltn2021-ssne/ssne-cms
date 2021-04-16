'use strict';
const dialogflow = require("@google-cloud/dialogflow");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
var namePattern = (arr) => {
    let result = [];
    if (arr.length > 0)
        result.push(arr[arr.length - 1]);
    if (arr.length > 1)
        result.push(`${arr[arr.length - 2]} ${arr[arr.length - 1]}`);
    if (arr.length > 2) {
        result.push(`${arr[0]} ${arr[arr.length - 1]}`);
        result.push(arr.join(' '));
    }
    return result;
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
                synonyms: namePattern(element.name.split(" "))
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
