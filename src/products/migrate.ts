import axios from "axios";
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
  // read products from file
  let products = JSON.parse(fs.readFileSync(dataFileName, "utf8"));
  let length = Object.keys(products).length;
  console.log("Migrating " + length + " products");

  // migrate products
  let idx = 0;
  for (let product of products) {
    idx++;

    const id = product.id;
    delete product.id;
    delete product.createdAt;
    delete product.createdBy;
    delete product.updatedAt;
    delete product.updatedBy;

    // log susbcription being migrated
    console.log("Migrating product: " + id + " (" + idx + "/" + length + ")");

    // submit migration request
    const migrationResponse = await axios({
      method: "post",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      url: baseUrl() + "/api/latest/settings/products",
      data: product,
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(
          "There was an error posting product " + id + ": " + error
        );
      });
    console.log(
      "Migrated product: " + id + ": " + JSON.stringify(migrationResponse)
    );

    // delay before sending next request
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("Migrated " + length + " products");
};

doMigration();
