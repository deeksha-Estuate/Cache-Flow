import axios from "axios";
import { readCSV } from "./migrate-csv";
var fs = require("fs");

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
  // read subscriptions from file
  let subscriptions = await readCSV(dataFileName);
  console.log("Migrating " + subscriptions.size + " subscriptions");

  // migrate subscriptions
  let idx = 0;
  for (const id of subscriptions.keys()) {
    idx++;
    const sub = subscriptions.get(id);

    // log susbcription being migrated
    console.log(
      "Migrating subscription: " +
        id +
        "(" +
        idx +
        "/" +
        subscriptions.size +
        ")"
    );
    // console.log(JSON.stringify(sub));
    // sub!.createProposalRequest?.proposalItems?.forEach(function (product) {
    //   console.log(product);
    // });

    // submit migration request
    const migrationResponse = await axios({
      method: "post",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      url: baseUrl() + "/api/latest/settings/stripe/subscriptions/migrations",
      data: sub,
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(
          "There was an error posting subscription " + id + ": " + error
        );
      });
    console.log(
      "Migrated subscription: " + id + ":" + JSON.stringify(migrationResponse)
    );

    // delay before sending next request
    await new Promise((r) => setTimeout(r, 5000));
  }
};

doMigration();
