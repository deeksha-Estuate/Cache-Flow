#!/bin/bash

# File with Product ID mapping (product name, prod value, dev value)
# Rendering Provider Fee (Medium Usage),34f43066-2e1f-4cf8-9ae7-7d25e2f22eb2,f13fe229-d725-49b6-b130-ec15afdada2f
INPUT_FILENAME=data/productIds.txt

# File to update. CSV with columns:
# id,proposalName,customerId,startDate,termType,termLength,autoRenewable,contractStatus,skipContract,markPastSchedulesAsPaid,customTerms,productId,productName,productQuantity,productPrice
UPDATE_FILENAME=data/ritten.csv

echo "#!/bin/bash" > updateProductIdsTemp.sh
awk -v updateFilename="$UPDATE_FILENAME" -F',' '{printf("sed -i '\'''\'' '\''s/%s/%s/g'\'' %s\n",$2,$3,updateFilename)}' $INPUT_FILENAME >> updateProductIdsTemp.sh

bash updateProductIdsTemp.sh
rm updateProductIdsTemp.sh