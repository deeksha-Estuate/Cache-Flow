import { stripeSubscription, migrationRequest, proposalItem } from "./types";
import * as csv from "csv-parser";
import * as fs from "fs";

export const readCSV = async (fileName: string) => {
  const subs = new Map<string, migrationRequest>();

  return new Promise<Map<string, migrationRequest>>(function (resolve, reject) {
    fs.createReadStream(fileName)
      .pipe(csv())
      .on("data", (data: stripeSubscription) => {
        // console.log("read data: " + JSON.stringify(data));

        // check if subscription already exists in dictionary, if not create
        if (!subs.has(data.id)) {
          let req: migrationRequest = {
            createProposalRequest: {
              name: data.proposalName,
              externalId: data.id,
              externalSource: {
                sourceType: "stripe",
                sourceId: data.id,
              },
              startDate: data.startDate,
              termType: data.termType != "" ? data.termType : "month",
              termQty: data.termLength,
              autoRenewable: data.autoRenewable,
              autoRenewalTermLength: data.autoRenewalTermLength,
              customTerms: data.customTerms,
              proposalItems: [],
            },

            // contract options
            skipContract: data.skipContract,
            contractOptions: {
              contractStatus: data.contractStatus,
              markPastSchedulesAsPaid: data.markPastSchedulesAsPaid,
              paymentMethodId: data.paymentMethodId,
              paymentMethodType: data.paymentMethodType,
              paymentMethodSource: data.paymentMethodSource,
            },
          };

          // handle setting customerId/externalCustomerId based on customerSource
          if (data.customerSource.toLowerCase() === "cacheflow") {
            req.customerId = data.customerId;
          } else {
            req.externalCustomerId = data.customerId;
          }

          subs.set(data.id, req);
        }
        // append product to subscription
        let req: migrationRequest | undefined = subs.get(data.id);
        if (req) {
          let product: proposalItem = {
            productId: data.productId,
            overrides: [
              {
                billingPeriod: data.termType != "" ? data.termType : undefined,
                price: {
                  amount: data.productPrice,
                  currency: "USD",
                },
                discount: false,
              },
            ],
          };
          // Only set product name if set (defaults to product name in db)
          if (data.productName != "") {
            product.name = data.productName;
          }

          // Products without quantity should be set as 0
          if (data.productQuantity > 0) {
            product.quantity = data.productQuantity;
          }
          req.createProposalRequest?.proposalItems?.push(product);
          subs.set(data.id, req);
        }
      })
      .on("end", () => {
        resolve(subs);
      });
  });
};
