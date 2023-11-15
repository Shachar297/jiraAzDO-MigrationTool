const 
    axios = require("axios"),
    config = require("../config/env");

async function executeGetAPI(domain) {

    let res = await axios.get({
        method: "GET",
        url: domain == "jira" ? config.jira.baseUrl : config.azureDevops.baseUrl,
        headers: {
            "Authorization": setHeaders(domain)
        }
    })
}

function setHeaders(domain) {
    if(domain == "jira") {
        return `Bearer ${config.jira.token}`
    }
    return ;

}