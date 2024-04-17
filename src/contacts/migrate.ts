import axios from "axios";
const fs = require('fs');
const util = require('util');


import { externalSource } from "./types";


import { readCSVFile } from "../utility/read-csv";

// read customer, environment, and data file name from arguments
var customerEnv = process.argv[2].toLowerCase();
var dataFileName = process.argv[3];

// split customer and environment from first argument
var customer = customerEnv.split(":")[0];
var env = customerEnv.split(":")[1];
console.log(
    "customer: " + customer + "; env: " + env + "; dataFileName: " + dataFileName
);

// read environments file
var envFile = JSON.parse(fs.readFileSync("environments.json", "utf8"));

// get auth token from environments file
var authToken = envFile[customerEnv];
console.log("authToken: " + envFile[customerEnv]);


// Create a writable stream to the log file
// const log_file_name = `logs/contact_error_${util.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}.log`; // error log file name
// const logStream = fs.createWriteStream(log_file_name, { flags: 'a' });

// // Redirect console.error to the log files
// const logError = (message: string) => {
//     logStream.write(util.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + ' - ' + message + '\n');
// };

// get baseUrl from customer and environment
const baseUrl = () => {
    switch (env) {
        case "prod":
            return "https://" + customer + ".api.getcacheflow.com";
        case "sandbox":
            return "https://" + customer + ".api.sandbox.getcacheflow.com";
        case "dev":
            return "https://" + customer + ".api.dev.getcacheflow.com";
        default:
            return "http://" + customer + ".api.localhost:8080";
    }
};
console.log("baseUrl: " + baseUrl());

const doMigration = async () => {
    try {
        const contacts = await readCSVFile(dataFileName);
        for (let contact of contacts) {
            try {
                const customerId = contact.customerId;
                delete contact.customerId;

                const externalSources: externalSource[] = [];

                const externalSourcesObj = {
                    sourceType: contact.source,
                    sourceId: contact.externalId,
                    externalLink: contact.externalLink
                };
                externalSources.push(externalSourcesObj);

                delete contact.source;
                delete contact.externalId;
                delete contact.externalLink;

                contact.externalSources = externalSources;

                console.log(contact);

                // submit migration request
                const migrationResponse = await axios({
                    method: "post",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    url: baseUrl() + `/api/latest/data/customers/${customerId}/contacts`,
                    data: contact,
                });

                console.log(`Migrated contact: ${contact.email} response: ${JSON.stringify(migrationResponse.data)}`);
            } catch (error) {
                console.error(`Error migrating contact: ${contact.email} message: ${error.message}`);
                const errorMessage = `contact: ${contact.email} message: ${error.message}`
                //logError(errorMessage);
            }
        }
    } catch (error) {
        console.error(`Error in main handler - doMigration: ${JSON.stringify(error)}`);
    }
};

doMigration();