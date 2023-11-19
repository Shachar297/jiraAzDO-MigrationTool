const
    config = require("../../config/env"),
    axios = require("axios"),
    jiraModule = require("../jira/Issue");


let workItemsToUpdateParentPostMigration = [];

async function createWorkItem(jiraIssue) {

    let
        token = `Basic ${Buffer.from(`:${config.azureDevops.token}`).toString('base64')}`,
        witType = setWorkItemType(jiraIssue),
        api = `${config.azureDevops.baseUrl}/${config.azureDevops.organization}/${config.azureDevops.project}/_apis/wit/workitems/$${witType}?api-version=7.0`,
        res;


    try {
        res = await axios({
            method: "POST",
            url: api,
            headers: {
                "Content-Type": "application/json-patch+json",
                "Authorization": token
            },
            data: await genereateWitData(jiraIssue)
        });

        if (jiraIssue.fields.customfield_10107) {
            workItemsToUpdateParentPostMigration.push(res.data)
        }
        return res.data
    } catch (error) {
        console.log(error)
        console.log(`${api} \n ${await genereateWitData(jiraIssue)}`)

    }


}

async function genereateWitData(jiraIssue) {

    const data = [
        {
            op: 'add',
            path: '/fields/System.Title',
            value: jiraIssue.fields.summary
        },
        {
            op: 'add',
            path: '/fields/System.Description',
            value: jiraIssue.fields.description ? jiraIssue.fields.description : ""
        },
        {
            op: 'add',
            path: '/fields/System.AssignedTo',
            value: "shachar.ovadia@codewizard.co.il"
        },
        {
            op: 'add',
            path: '/fields/Custom.JiraIssueKey',
            value: jiraIssue.key
        }
    ]

    if (isJiraIssueHasEpicLink(jiraIssue)) {
        let jiraIssueParent = await jiraModule.getParent(jiraIssue.fields.customfield_10107);
        let azureDevopsParent = await getRelatedWorkItem(jiraIssueParent.key);

        data.push({
            op: 'add',
            path: "/relations/-",
            value: {
                rel: 'System.LinkTypes.Hierarchy-Reverse',
                url: azureDevopsParent,
                attributes: {
                    comment: "Added parent according to Jira parent issue."
                }

            }
        })
    }

    if (isJiraIssueHasFixVersion(jiraIssue)) {
        data.push({
            op: 'add',
            path: "/fields/Custom.Release",
            value: jiraIssue.fields.fixVersions[0].name
        })
    }

    if (isJiraIssueHasLinks(jiraIssue)) {
        for (let i = 0; i < jiraIssue.fields.issuelinks.length; i++) {
            if (jiraIssue.fields.issuelinks[i].outwardIssue) {
                let linkedJiraIssueKey = jiraIssue.fields.issuelinks[i].outwardIssue.key;

                let relatedWorkItem = await getRelatedWorkItem(linkedJiraIssueKey);

                if (relatedWorkItem) {
                    data.push({
                        op: 'add',
                        path: "/relations/-",
                        value: {
                            rel: 'System.LinkTypes.Related',
                            url: relatedWorkItem,
                            attributes: {
                                comment: "Added Linked according to Jira Linked issue."
                            }
                        }
                    })
                }

            }
        }
        for (let i = 0; i < jiraIssue.fields.issuelinks.length; i++) {
            if (jiraIssue.fields.issuelinks[i].inwardIssue) {
                let linkedJiraIssueKey = jiraIssue.fields.issuelinks[i].inwardIssue.key;

                let relatedWorkItem = await getRelatedWorkItem(linkedJiraIssueKey);
                if (relatedWorkItem) {
                    data.push({
                        op: 'add',
                        path: "/relations/-",
                        value: {
                            rel: 'System.LinkTypes.Related',
                            url: relatedWorkItem,
                            attributes: {
                                comment: "Added Linked according to Jira Linked issue."
                            }
                        }
                    })

                }
            }
        }
    }

    if (isIssueHasSprint(jiraIssue)) {
        let originalSprintName = config.azureDevops.project + '\\\\' + jiraIssue.fields.customfield_10108[0].split("name=")[1].split(",")[0];
        console.log(originalSprintName);
        data.push({
            "op": "add",
            "path": "/fields/System.IterationPath",
            "value": originalSprintName
        })
    }

    return data;
}

function isIssueHasSprint(jiraIssue) {
    return (jiraIssue.fields.customfield_10108 && jiraIssue.fields.customfield_10108.length > 0)
}

function isJiraIssueHasFixVersion(jiraIssue) {
    return (jiraIssue.fields.fixVersions && jiraIssue.fields.fixVersions.length > 0)
}

function isJiraIssueHasEpicLink(jiraIssue) {
    return jiraIssue.fields.customfield_10107
}

function isJiraIssueHasLinks(jiraIssue) {
    return (jiraIssue.fields.issuelinks && jiraIssue.fields.issuelinks.length > 0)
}

function setWorkItemType(jiraIssue) {
    let witType = "";

    switch (jiraIssue.fields.issuetype.name) {
        case "Story":
            witType = "User Story"
            break;
        case "Epic":
            witType = "Epic"
            break;
        case "Task":
            witType = "Task"
            break;
        default:
            break;
    }

    return witType
}


async function getRelatedWorkItem(relationItemKey) {
    const token = `Basic ${Buffer.from(`:${config.azureDevops.token}`).toString('base64')}`;

    const
        jiraIssueKeyField = 'Custom.JiraIssueKey',
        apiUrl = `${config.azureDevops.baseUrl}/${config.azureDevops.organization}/${config.azureDevops.project}/_apis/wit/wiql?api-version=7.1`,
        data = {
            "query": `Select [System.Id] From WorkItems Where ${jiraIssueKeyField} = '${relationItemKey}'`
        }

    try {
        const response = await axios({
            method: "POST",
            url: apiUrl,
            headers: {
                'Authorization': token
            },
            data: data
        });

        // Handle the response

        return response.data.workItems.length > 0 ? response.data.workItems[0].url : null;
    } catch (error) {
        console.error('Error fetching work items:', error);
    }
}

async function addWorkItemComments(workItemId, comment) {
    const token = `Basic ${Buffer.from(`:${config.azureDevops.token}`).toString('base64')}`;

    try {
        let res = await axios({
            method: "POST",
            url: `${config.azureDevops.baseUrl}/${config.azureDevops.organization}/${config.azureDevops.project}/_apis/wit/workItems/${workItemId}/comments?api-version=7.1-preview`,
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            data: {
                text: comment.body
            }
        });
        return res.data
    } catch (error) {
        console.log(error)
    }
}

async function changeWorkItemState(workItemId, state) {
    let
        token = `Basic ${Buffer.from(`:${config.azureDevops.token}`).toString('base64')}`,
        api = `${config.azureDevops.baseUrl}/${config.azureDevops.organization}/${config.azureDevops.project}/_apis/wit/workItems/${workItemId}?api-version=7.0`,
        data = [
            {
                op: 'add',
                path: '/fields/System.State',
                value: await generateNewState(state),
            }
        ];

    try {
        let res = await axios({
            method: "PATCH",
            url: api,
            headers: {
                "Content-Type": "application/json-patch+json",
                "Authorization": token
            },
            data: data
        });

        return res.data;
    } catch (error) {
        console.log(error)
    }
}

function generateNewState(state) {
    let newState = "";

    switch (state) {
        case "In Progress":
            newState = "Doing"
            break;
        case "Done":
            newState = state;
            break;
        case "In Code Review":
            newState = state;
            break;
        case "Code Review Rejected":
            newState = state;
            break;
        default:
            break;
    }
    return newState
}



module.exports = {
    createWorkItem,
    addWorkItemComments,
    changeWorkItemState
}