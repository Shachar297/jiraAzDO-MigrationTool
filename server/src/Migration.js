const
    azureDevopsModule = require("./azure-devops/Wit"),
    jiraModule = require("./jira/Issue"),
    config = require("../config/env.js"),
    jiraIssueTypesModule = require("./jira/IssueType"),
    azureDevopsWorkItemTypesModule = require("./azure-devops/WitType");


async function handleMigrationFromAzDoToJira(req, res) {
    setConfig(req);

    try {
       let workItemsList = await azureDevopsModule.getAllWorkItems();
       for(let i = 0; i < workItemsList.length; i++) {
        let currentWorkItem = await azureDevopsModule.getWorkItemById(workItemsList[i].id);
        let newJiraIssue = await jiraModule.createJiraIssue(currentWorkItem);
        console.log(`Success ---> New Jira Issue ${newJiraIssue.key} Has been Migrated!`);
        res.write(JSON.stringify(newJiraIssue));
        if(azureDevopsModule.workItemHasComments(currentWorkItem)) {
            let workItemComments = await azureDevopsModule.getWorkItemComments(currentWorkItem.id);
            console.log(workItemComments)
            for(let comment = 0; comment < workItemComments.comments.length; comment++) {
                let commentAddedToIssue = jiraModule.addIssueComments(workItemComments.comments[comment].text, newJiraIssue.key)
                console.log(`Comment added to issue ${newJiraIssue.key}`);
            }
        }   
    }

    } catch (error) {
        return Promise.reject(error)
    }
}

async function handleMigrationFromJiraToAzDO(req, res) {

    setConfig(req)

    try {
        let jiraEpics = await jiraModule.getAllEpics();

        for (let epic = 0; epic < jiraEpics.length; epic++) {
            let
                response = await azureDevopsModule.createWorkItem(jiraEpics[epic]),
                workItemId = response.id,
                comments = await jiraModule.getAllIssueComments(jiraEpics[epic].key),
                issueStatus = jiraEpics[epic].fields.status.name;
                response.totalWorkItemsToMigrate = jiraEpics.length

            await handleCommentsMigration(comments, workItemId);
            if(issueStatus != "To Do") {
                JSON.stringify(await azureDevopsModule.changeWorkItemState(workItemId, issueStatus));
            }

            res.write(JSON.stringify(response));

        }
        let issues = await jiraModule.getAllJiraIssues();

        for (let i = 0; i < issues.length; i++) {
            let
                response = await azureDevopsModule.createWorkItem(issues[i]),
                workItemId = response.id,
                comments = await jiraModule.getAllIssueComments(issues[i].key),
                issueStatus = issues[i].fields.status.name;
                response.totalWorkItemsToMigrate = issues.length;

            await handleCommentsMigration(comments, workItemId);

            if(issueStatus != "To Do") {
                JSON.stringify(await azureDevopsModule.changeWorkItemState(workItemId, issueStatus));
            }

            res.write(JSON.stringify(response))
        }

        res.end()

    } catch (error) {
        console.log(error, " ??")
    }


}

async function handleCommentsMigration(comments, workItemId) {
    if (comments.length > 0) {
        for (let comment = 0; comment < comments.length; comment++) {
            let commentAdded = await azureDevopsModule.addWorkItemComments(workItemId, comments[comment]);
            return commentAdded;
        }
    }
}

async function migrateInfrastructure() {
    try {
        let jiraIssueTypes = await jiraIssueTypesModule.getAllIssueTypes();
        let azDoWorkItemTypes = await azureDevopsWorkItemTypesModule.getAllWorkItemTypes();


    } catch (error) {

    }

}

async function migrateEpics() {
    try {
        let jiraEpics = await jiraModule.getAllEpics();
        for (let epic = 0; epic < jiraEpics.length; epic++) {
            return await azureDevopsModule.createWorkItem(jiraEpics[epic]);
        }
    } catch (error) {
        console.log(error)
    }

}

async function migrateIssues() {
    try {
        let issues = await jiraModule.getAllJiraIssues();
        for (let i = 0; i < issues.length; i++) {
            return await azureDevopsModule.createWorkItem(issues[i])
        }
    } catch (error) {
        console.log(error)
    }

}

function setConfig(req) {
    config.jira = req.body.jira;
    config.azureDevops = req.body.azureDevops;
}

module.exports = {
    handleMigrationFromJiraToAzDO,
    handleMigrationFromAzDoToJira
}