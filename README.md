# Jira -> Azure Devops Migration

#### This Project is built for migrating Jira Server to Azure Devops, and Azure Devops to Jira Server.

#### What you will need to start migration

* Easiest way to start the application is having docker installed on your computer.
* * You can copy the [docker-compose](./docker-compose.yaml) file to your workspace and ``` docker-compose up -d ``` to initialize the migration application.

* If you want to use this locally, close this repository, make sure nodejs and npm is installed. Then: ```cd server; node app.js ```

#### On Both ways (docker / locally), you will need to adjust some configuration (explained below).

#### * When Using Docker, open port 8082 on your browser to enter the web application,

#### * When using locally, enter the app path.

###### -------------------------------------------------------------------------------------------

## Adjustments 

#### After opening the web application, you will see two forms, there you'll need to configure source and destination.

* Jira
* * Base URL: Jira base url
* * * I personally use Jira server installed upon docker container, so the base url goes here: http://localhost:8080

* * Project Key

* * API Token [Create an API Token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) or use an existing one.

<br>

* Azure Devops
* * Base URL: for example, in a cloud instance - https://dev.azure.com
* * Organization
* * Project Name
* * API Token [Create an API Token](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows) Or use an existing one.

