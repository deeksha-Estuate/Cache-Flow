import axios from "axios";
var fs = require("fs");
const util = require('util');



import { customer, billingAddress, shippingAddress, contacts } from "./types";


import { readCSVFile } from "../utility/read-csv";

//read customer, environment, and data file name from arguments
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

//Create a writable stream to the log file
const log_file_name = `logs/customer_error_${util.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}.log`; // error log file name
const logStream = fs.createWriteStream(log_file_name, { flags: 'a' });

// Redirect console.error to the log file
const logError = (message: string) => {
    logStream.write(util.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + ' - ' + message + '\n');
};


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
        const customers = await readCSVFile(dataFileName);
        for (let customer of customers) {
            try {

                const billingAddressObj: billingAddress = {
                    streetAddress: customer['billingAddress.streetAddress'],
                    city: customer['billingAddress.city'],
                    region: customer['billingAddress.region'],
                    postalCode: customer['billingAddress.postalCode'],
                    country: customer['billingAddress.country']
                };

                const shippingAddressObj: shippingAddress = {
                    streetAddress: customer['shippingAddress.streetAddress'],
                    city: customer['shippingAddress.city'],
                    region: customer['shippingAddress.region'],
                    postalCode: customer['shippingAddress.postalCode'],
                    country: customer['shippingAddress.country']
                };

                const contacts: contacts[] = [];

                const  contactsObj = {
                    firstName: customer['firstName'],
                    lastName: customer['lastName'],
                    email: customer['email'],
                    isBillingContact: true
                };

                contacts.push(contactsObj);

                const customer_obj: customer = {
                    name: customer.name,
                    billingAddress: billingAddressObj,
                    shippingAddress: shippingAddressObj,
                    contacts
                };

                
                // submit migration request
                const migrationResponse = await axios({
                    method: "post",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    url: baseUrl() + `/api/latest/data/customers`,
                    data: customer_obj,
                });

                console.log(`Migrated customer: ${customer.name} response: ${JSON.stringify(migrationResponse.data)}`);
            } catch (error) {
                const err = error as Error;
                console.error(`Error migrating cutomer: ${customer.name} message: ${err.message}`);
                const errorMessage = `customer: ${customer.name} message: ${err.message}`
                logError(errorMessage);
            }
            return console.log("Migration completed successfully.");
        }
        
    } catch (error) {
        console.error(`Error in main handler - doMigration: ${JSON.stringify(error)}`);
    }
};

doMigration();
