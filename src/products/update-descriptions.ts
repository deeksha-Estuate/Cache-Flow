import axios from "axios";
import { Product } from "./types";
import * as csv from "csv-parser";
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
      return "http://" + customer + ".api.localhost:8080";
  }
};
console.log("baseUrl: " + baseUrl());

const readCSV = async (fileName: string) => {
  const products = new Array();

  return new Promise<Product[]>(function (resolve, reject) {
    fs.createReadStream(fileName)
      .pipe(csv())
      .on("data", (product: Product) => {
        products.push(product);
      })
      .on("end", () => {
        resolve(products);
      });
  });
};

const doUpdateDescriptions = async () => {
  // read products from file
  let productUpdates = await readCSV(dataFileName);
  let length = Object.keys(productUpdates).length;
  console.log("Updating " + length + " product descriptions");

  // dump products list
  const productSummaries = await axios({
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
  let summariesLength = Object.keys(productSummaries).length;
  console.log("Dumped " + summariesLength + " product summaries");

  // Get all products to map internal name -> id
  let productIdMap = new Map();
  for (let productSummary of productSummaries) {
    productIdMap.set(productSummary.internalName, productSummary.id);
  }

  // migrate products
  let idx = 0;
  for (let productUpdate of productUpdates) {
    idx++;

    // log susbcription being migrated
    console.log(
      "Updating product description: " +
        productUpdate.internalName +
        " (" +
        idx +
        "/" +
        length +
        ")"
    );

    let productId = productIdMap.get(productUpdate.internalName);
    if (productId === undefined) {
      console.log(
        "No product for internal name: " + productUpdate.internalName
      );
      continue;
    }

    // Dump full product
    const product = await axios({
      method: "get",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      url: baseUrl() + "/api/latest/settings/products/" + productId,
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(
          "There was an error dumping products: " + error.response.data
        );
      });
    product.description = productUpdate.description;

    // submit update request
    const migrationResponse = await axios({
      method: "post",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      url:
        baseUrl() + "/api/latest/settings/products/" + productId + "/versions",
      data: product,
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(
          "There was an error updating product " +
            productUpdate.internalName +
            ": " +
            JSON.stringify(error.response.data)
        );
      });
    console.log(
      "Updated product description: " +
        productUpdate.internalName +
        ": " +
        JSON.stringify(migrationResponse)
    );

    // delay before sending next request
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("Updated " + length + " products");
};

doUpdateDescriptions();
