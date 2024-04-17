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

const doDump = async () => {
  console.log("Dumping products list");

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
      console.error("There was an error dumping products: " + error);
    });
  let length = Object.keys(products).length;

  // dump full products
  let fullProducts = new Array();
  let idx = 0;
  for (const product of products) {
    idx++;
    console.log(
      "Dumping product: " + product.id + " (" + idx + "/" + length + ")"
    );

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
        console.error("There was an error dumping products: " + error);
      });

    fullProducts.push(productResponse);
    // delay before sending next request
    await new Promise((r) => setTimeout(r, 1000));
  }

  // write products to file
  fs.writeFile(dataFileName, JSON.stringify(fullProducts), (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });

  console.log("Dumped " + Object.keys(fullProducts).length + " products");
};

doDump();
