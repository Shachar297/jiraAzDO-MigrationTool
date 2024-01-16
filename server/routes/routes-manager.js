const
    express = require('express'),
    router = express.Router(),
    migrationModule = require("../src/Migration");

// Migration
router.post("/", migrationModule.handleMigrationFromJiraToAzDO);
router.post("/azure/", migrationModule.handleMigrationFromAzDoToJira);

// Health check,
router.get("", (req, res) => {
    res.send(`Migration Manager is ready and listening on ${process.env.PORT}\n`)
});

module.exports = router;