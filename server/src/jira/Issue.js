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

// ----------------------------------------------------------------
// This code blocks (all the below) related to the azure devops migration to jira.
// ----------------------------------------------------------------

async function createJiraIssue(workItem) {
    let api = `${config.jira.baseUrl}/rest/api/2/issue`,
        data = generateIssueData(workItem);
    try {
        let res = await axios({
            method: "POST",
            url: api,
            headers: {
                "Authorization": `Bearer ${config.jira.token}`,
                "Content-Type": "application/json"
            },
            data: data
        });

        return res.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

function generateIssueData(workItem) {
    if (workItem.fields["System.WorkItemType"] == "User Story")
        workItem.fields["System.WorkItemType"] = "Story";

    let data = {
        fields: {
            project: {
                key: config.jira.project
            },
            summary: workItem.fields["System.Title"],
            issuetype: {
                name: workItem.fields["System.WorkItemType"]
            }
        }
    }

    if (workItem.fields["System.WorkItemType"] == "Epic") {
        data.fields["customfield_10104"] = workItem.fields["System.Title"]
    }

    return data;
}

async function addIssueComments(workItemComment, issueKey) {
    let api = `${config.jira.baseUrl}/rest/api/2/issue/${issueKey}/comment`,
        data = {
            body: workItemComment
        };

    try {
        let res = await axios({
            method: "POST",
            url: api,
            headers: {
                "Authorization": `Bearer ${config.jira.token}`,
                "Content-Type": "application/json"
            },
            data: data
        });

        return res.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

module.exports = {
    getAllJiraIssues,
    getParent,
    getAllEpics,
    getAllIssueComments,
    createJiraIssue,
    addIssueComments
}