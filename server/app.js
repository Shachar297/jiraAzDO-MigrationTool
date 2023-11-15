require("dotenv").config();

const
    cors = require('cors'),
    express = require('express'),
    server = express(),
    routesManager = require("./routes/routes-manager"),
    PORT = 8081 || process.env.PORT;

server.use(cors({origin : "*", }));
server.use(express.json());
server.use("/api", routesManager);

server.listen(PORT, () => console.log(`Migration Manager is ready and listening on ${PORT}`));