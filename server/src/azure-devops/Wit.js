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
        res

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
        console.log(res.data, " ?!")
        if(jiraIssue.fields.customfield_10107) {
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


    if(jiraIssue.fields.customfield_10107) {
        // let jiraIssueParent = await jiraModule.getParent(jiraIssue.fields.customfield_10107);

        // data.push({
        //     op: 'add',
        //     path: "/relations/-",
        //     value: {
        //         rel: 'System.LinkTypes.Hierarchy-Reverse',

        //     }
        // })
    }

    return data;
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


function getParentWorkItem() {

}

module.exports = {
    createWorkItem
}