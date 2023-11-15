const
    express = require('express'),
    router = express.Router(),
    migrationModule = require("../src/Migration");


router.post("/", migrationModule.handleMigration);

module.exports = router;