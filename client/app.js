document.addEventListener("DOMContentLoaded", function () {
    let isAzureTokenVisible = false;
    let isJiraTokenVisible = false;

    // Left Form Elements
    const leftBaseUrlInput = document.getElementById("leftBaseUrl");
    const leftTokenInput = document.getElementById("leftToken");
    const leftProjectInput = document.getElementById("leftProject");
    const leftConfigureBtn = document.getElementById("leftConfigureBtn");
    const jiraEyeIcon = document.getElementById("jira-eye-icon");
    const fileInput = document.getElementById("fileInput");
    // Right Form Elements
    const rightBaseUrlInput = document.getElementById("rightBaseUrl");
    const rightTokenInput = document.getElementById("rightToken");
    const rightProjectInput = document.getElementById("rightProject");
    const rightConfigureBtn = document.getElementById("rightConfigureBtn");
    const rightOrganizationInput = document.getElementById("rightOrganization");

    const azEyeIcon = document.getElementById('azure-eye-icon');

    const migrationExplainationDiv = document.getElementById("migration-expl");

    const containerLogs = document.getElementById("container-logs");

    containerLogs.style.display = "none";

    const migrateBtn = document.getElementById("migrateBtn");
    const progressBar = document.getElementById("progressBar");
    const migrationProgressBar = document.getElementById("progressBarLogs");

    // migrationProgressBar.parentElement.style.display = "none";

    const migrationCounter = document.getElementById("migration-counter");
    migrationCounter.style.display = "none";
    migrationCounter.innerHTML = 0;
    let counter = 0;
    let leftInputsFilled = 0;
    let rightInputsFilled = 0;

    let migrationServerUrl = "http://localhost:8081/api/";

    azEyeIcon.addEventListener('click', function () {
        isAzureTokenVisible = !isAzureTokenVisible;
        rightTokenInput.type = isAzureTokenVisible ? 'text' : 'password'
    });
    jiraEyeIcon.addEventListener('click', function () {
        isJiraTokenVisible = !isJiraTokenVisible;
        leftTokenInput.type = isJiraTokenVisible ? 'text' : 'password'
    });

    // Left Configure Button Click Event
    leftConfigureBtn.addEventListener("click", function () {
        // Enable and clear Right Form inputs
        rightBaseUrlInput.disabled = false;
        rightTokenInput.disabled = false;
        rightProjectInput.disabled = false;
        rightOrganizationInput.disabled = false;
        rightBaseUrlInput.value = "https://dev.azure.com";
        // rightTokenInput.value = "";
        // rightProjectInput.value = "";

        // Enable Right Configure Button
        rightConfigureBtn.disabled = false;
    });

    leftConfigureBtn.addEventListener("click", function () {
        // ... (previous code)

        // Update progress and enable Migrate button
        leftInputsFilled = 3; // Assuming all left inputs are filled
        updateProgressBar();
    });

    // Right Configure Button Click Event
    rightConfigureBtn.addEventListener("click", function () {
        // ... (previous code)

        // Update progress and enable Migrate button
        rightInputsFilled = 3; // Assuming all right inputs are filled
        updateProgressBar();
    });

    function updateProgressBar() {
        const totalInputs = 6; // Total number of inputs (3 for left form, 3 for right form)
        const progress = ((leftInputsFilled + rightInputsFilled) / totalInputs) * 100;
        progressBar.style.width = progress + "%";

        // Enable Migrate button if all inputs are filled
        if (leftInputsFilled + rightInputsFilled === totalInputs) {
            migrateBtn.disabled = false;
        }
    }
    migrateBtn.addEventListener("click", async function () {
        // Execute migration function with the specified objects
        const migrationData = {
            jira: {
                baseUrl: leftBaseUrlInput.value,
                token: leftTokenInput.value,
                project: leftProjectInput.value,
            },
            azureDevops: {
                baseUrl: rightBaseUrlInput.value,
                token: rightTokenInput.value,
                organization: rightOrganizationInput.value,
                project: rightProjectInput.value,
            },
        };

        let resData;
        try {
            let res = await fetch(migrationServerUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(migrationData)
            });

            if (res) {
                containerLogs.style.display = "block";
                generateMessage(`<p style="color:green";>
                Migration is starting from ${migrationData.jira.baseUrl}/${migrationData.jira.project} -> ${migrationData.azureDevops.baseUrl}/${migrationData.azureDevops.organization}/${migrationData.azureDevops.project}</p>`)
                migrateBtn.disabled = true;
                rightConfigureBtn.disabled = true;
                leftConfigureBtn.disabled = true;
                migrationExplainationDiv.style.display = 'none';
                // migrationProgressBar.parentElement.style.display = "block";
                // migrationProgressBar.style.display = "block";
            }

            const stream = res.body;
            const reader = stream.getReader();
            const textDecoder = new TextDecoder();

            migrationCounter.style.display = 'block'

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                let jsonResponse = JSON.parse(textDecoder.decode(value));

                if (jsonResponse.fields) {
                    generateMessage(`Jira Issue (${JSON.stringify(jsonResponse.fields["System.WorkItemType"])})  ${JSON.stringify(jsonResponse.fields["Custom.JiraIssueKey"])} Migrated -> ${JSON.stringify(jsonResponse._links.self.href)}`)
                    counter++;
                    updateMigrationProgressBar(counter, jsonResponse.totalWorkItemsToMigrate)
                    migrationCounter.innerHTML = `Total Migrated Work Items: <span style="color: green;"> ${counter} </span>`;
                }
                if (jsonResponse.text) {
                    generateMessage(`Adding comment for work Item ${JSON.stringify(jsonResponse.workItemId)}...`)
                }

            }


        } catch (error) {
            console.log(error)
        }

        return resData;

        // Example: Output the migration data to console
        console.log("Migration Data:", migrationData);
        // You can add your migration logic here

        function generateMessage(message) {
            containerLogs.innerHTML += `${generateTimeStamp()} ` + message + "</br>" + "------------------------------------ </br>";
        }

        function generateTimeStamp() {
            const currentDate = new Date();

            // Extract the components
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
            const day = String(currentDate.getDate()).padStart(2, '0');
            const hours = String(currentDate.getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');

            // Create the timestamp in the desired format
            const timestamp = `<span style="color: turquoise;">[${year}-${month}-${day} ${hours}:${minutes}]: </span></br>`;

            return timestamp
        }

        function updateMigrationProgressBar(index, size) {
            let progress = index * 10;
            if (progress == 90 || progress == 80 || progress == 100) {
                progress -= 5;
            }
            console.log(progress)
            migrationProgressBar.style.width = progress + "%";
        }




    });

    fileInput.addEventListener("change", function (input) {

        // Get the selected file(s)
        var files = input.target.files;
        console.log(input.files)
        // Check if any file is selected
        if (files.length > 0) {
            // Get the first file (assuming only one file is selected)
            var file = files[0];

            // Validate the file name
            if (file.name === 'env-client.json') {
                // Use FileReader to read the content of the file
                var reader = new FileReader();

                reader.onload = function (e) {

                    leftBaseUrlInput.value = JSON.parse(e.target.result).jira.baseUrl
                    leftTokenInput.value = JSON.parse(e.target.result).jira.token
                    leftProjectInput.value = JSON.parse(e.target.result).jira.project

                    rightBaseUrlInput.value = JSON.parse(e.target.result).azureDevops.baseUrl
                    rightTokenInput.value = JSON.parse(e.target.result).azureDevops.token
                    rightOrganizationInput.value = JSON.parse(e.target.result).azureDevops.organization
                    rightProjectInput.value = JSON.parse(e.target.result).azureDevops.project;
                };

                // Read the file as text
                reader.readAsText(file);
            } else {
                alert('Please select a file named "env.js".');
            }
        }
    })

});


function showConfiguration() {

    document.getElementsByClassName("migration-screen")[0].style.display = "none"
    document.getElementById("markdownContainer").style.display = "block"
    const configurationText = `     
    ## Download configuration file.
    ### Configure File as configured below: 

    module.exports = {
        jira: {
            baseUrl: "my-jira.atlassian.net/ or my-jira-server/",
            token: "API-TOKEN",
            project: "PROJECT-KEY or PROJECT NAME"
        },
        azureDevops: {
            baseUrl: "dev.azure.com/ or my-azure-devops-server",
            token: "API-TOKEN",
            project: "PROJECT-NAME",
            organization: "ORGANIZATION-NAME"
        }
    }
    `

    document.getElementById("markdownContainer").innerHTML = marked.parse(configurationText)
}

function hideConfiguration() {

    document.getElementsByClassName("migration-screen")[0].style.display = "block"
    document.getElementById("markdownContainer").style.display = "none"
}

