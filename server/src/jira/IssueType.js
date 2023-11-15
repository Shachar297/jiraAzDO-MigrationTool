const
    axios = require('axios'),
    config = require("../../config/env");

async function getAllIssueTypes() {
    let
        res;

    try {
        res = await axios({
            method: "GET",
            url: `${config.jira.baseUrl}/rest/api/2/issuetype`,
            headers: {
                "Authorization": `Bearer ${config.jira.token}`
            }
        })
    } catch (error) {
        console.log(error)
    }

    console.log(res)
}

module.exports = {
    getAllIssueTypes
}