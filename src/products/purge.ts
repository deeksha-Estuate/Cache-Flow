import axios from "axios";
var fs = require("fs");

// read customer, environment, and data file name from arguments
var customerEnv = process.argv[2].toLowerCase();

// split customer and environment from first argument
var customer = customerEnv.split(":")[0];
var env = customerEnv.split(":")[1];
console.log("customer: " + customer + "; env: " + env);

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

const doPurge = async () => {
  console.log("Dumping products");

  // dump products
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
  console.log("Deleting " + length + " products");

  let idx = 0;
  let deleted = 0;
  for (const product of products) {
    idx++;
    console.log(
      "Deleting product: " + product.id + " (" + idx + "/" + length + ")"
    );

    if (product.status === "active") {
      let p = product;
      p.status = "inactive";

      // deactivate product
      await axios({
        method: "post",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        url:
          baseUrl() +
          "/api/latest/settings/products/" +
          product.id +
          "/versions",
        data: p,
      })
        .then(async (response) => {
          console.log("Deactivated product: " + product.id);
        })
        .catch((error) => {
          console.error(
            "There was an error deactivating product " +
              product.id +
              " : " +
              error
          );
        });
    } else {
      // delete product
      await axios({
        method: "delete",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        url: baseUrl() + "/api/latest/settings/products/" + product.id,
      })
        .then((response) => {
          console.log("Deleted product: " + product.id);
          deleted++;
        })
        .catch((error) => {
          console.error(
            "There was an error deleting product " + product.id + " : " + error
          );
        });
    }

    // delay before sending next request
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(
    "Deleted (" +
      deleted +
      "/" +
      length +
      ") products. Run again to delete deactivated products"
  );
};

doPurge();
