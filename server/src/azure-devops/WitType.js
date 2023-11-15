const
    axios = require("axios"),
    config = require("../../config/env");

require("dotenv").config();

async function getAllWorkItemTypes() {
    let
        api = `${config.azureDevops.baseUrl}/${config.azureDevops.organization}/${config.azureDevops.project}/_apis/wit/workitemtypes?api-version=7.0`,
        token = `Basic ${Buffer.from(`:${config.azureDevops.token}`).toString('base64')}`,
        res;

    try {
        res = await axios({
            method: "GET",
            url: api,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    } catch (error) {
        console.log(error)
    }

}

function createWorkItemType(jiraIssueType) {
    let api = `${config.azureDevops.baseUrl}/${config.azureDevops.organization}/${config.azureDevops.project}/_apis/process/processes/${process.env.AZDO_PROCESS_ID}/workItemTypes/`;
}



module.exports = {
    getAllWorkItemTypes,
    createWorkItemType
}