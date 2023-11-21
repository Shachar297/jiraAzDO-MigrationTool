const
    express = require('express'),
    router = express.Router(),
    migrationModule = require("../src/Migration");


router.post("/", migrationModule.handleMigration);
router.get("", (req, res) => {
    res.send(`Migration Manager is ready and listening on ${process.env.PORT}\n`)
})
module.exports = router;