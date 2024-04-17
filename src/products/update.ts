import axios from "axios";
import * as fs from "fs";

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
      return "http://" + customer + ".localhost:8080";
  }
};
console.log("baseUrl: " + baseUrl());

const doUpdate = async () => {
  // dump products list
  const products = await axios({
    method: "get",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    url: baseUrl() + "/api/latest/settings/products?filterBy=visible",
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(
        "There was an error dumping products: " + error.response.data
      );
    });
  let summariesLength = Object.keys(products).length;
  console.log("Dumped " + summariesLength + " product summaries");

  // migrate products
  let idx = 0;
  for (let product of products) {
    idx++;

    // log susbcription being migrated
    console.log(
      "Updating product: " +
        product.name +
        " (" +
        idx +
        "/" +
        summariesLength +
        ")"
    );

    // Dump full product
    const productResponse = await axios({
      method: "get",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      url: baseUrl() + "/api/latest/settings/products/" + product.id,
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(
          "There was an error dumping product: " +
            JSON.stringify(error.response.data)
        );
      });
    if (productResponse === undefined) {
      continue;
    }

    if (productResponse.customizable === true) {
      console.log("Skip updating product: " + productResponse.customizable);
      continue;
    }
    if (productResponse.status === "inactive") {
      console.log("Skip inactive product: " + productResponse.status);
      continue;
    }

    productResponse.customizable = true;

    // submit update request
    const migrationResponse = await axios({
      method: "post",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      url:
        baseUrl() + "/api/latest/settings/products/" + product.id + "/versions",
      data: productResponse,
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(
          "There was an error updating product " +
            product.name +
            ": " +
            JSON.stringify(error.response.data)
        );
      });
    console.log("Updated product: " + product.name);

    // delay before sending next request
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("Updated " + summariesLength + " products");
};

doUpdate();
