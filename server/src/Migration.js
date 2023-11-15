const
    azureDevopsModule = require("./azure-devops/Wit"),
    jiraModule = require("./jira/Issue"),
    config = require("../config/env.js"),
    jiraIssueTypesModule = require("./jira/IssueType"),
    azureDevopsWorkItemTypesModule = require("./azure-devops/WitType");

async function handleMigration(req, res) {
    config.jira = req.body.jira;
    config.azureDevops = req.body.azureDevops;
    let issues = []
    try {
        issues = await jiraModule.getAllJiraIssues();
        for(let i = 0; i < issues.length; i++) {
            res.json(await azureDevopsModule.createWorkItem(issues[i]))
        }
    } catch (error) {
        // console.log(error, " ??")
    }
}

async function migrateInfrastructure() {
    let jiraIssueTypes = await jiraIssueTypesModule.getAllIssueTypes();
    let azDoWorkItemTypes = await azureDevopsWorkItemTypesModule.getAllWorkItemTypes();
}

module.exports = {
    handleMigration
}