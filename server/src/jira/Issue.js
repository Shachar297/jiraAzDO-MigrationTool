const
    config = require("../../config/env"),
    axios = require("axios");


async function getAllJiraIssues() {
    let jql = `PROJECT=${config.jira.project}`
    let res = await axios({
        method: "POST",
        url: `${config.jira.baseUrl}/rest/api/2/search`,
        headers: {
            "Authorization": `Bearer ${config.jira.token}`,
            "Content-Type": "application/json"
        },
        data: {
            jql: `PROJECT=${config.jira.project} AND type != Epic order by type ASC`
        }
    });

    return res.data.issues
}

async function getParent(parentKey) {
    let api = `${config.jira.baseUrl}/rest/api/2/issue/${parentKey}`;

    try {
        let res = await axios({
            method: 'GET',
            url: api,
            headers: {
                "Authorization": `Bearer ${config.jira.token}`
            }
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
}

async function getAllEpics() {
    let jql = `PROJECT=${config.jira.project}`
    let res = await axios({
        method: "POST",
        url: `${config.jira.baseUrl}/rest/api/2/search`,
        headers: {
            "Authorization": `Bearer ${config.jira.token}`,
            "Content-Type": "application/json"
        },
        data: {
            jql: `PROJECT=${config.jira.project} AND type = Epic`
        }
    });

    return res.data.issues
}

async function getAllIssueComments(issueKey) {
    try {
        let res = await axios({
            method: "GET",
            url: `${config.jira.baseUrl}/rest/api/2/issue/${issueKey}/comment`,
            headers: {
                "Authorization": `Bearer ${config.jira.token}`
            }
        });
        return res.data.comments
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getAllJiraIssues,
    getParent,
    getAllEpics,
    getAllIssueComments
}