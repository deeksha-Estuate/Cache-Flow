export interface Customer {
    name: string;
    externalId: string;
    externalSource: string;
}

export interface billingAddres{
    streetAddress: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
}

export interface shippingAddres{
    streetAddress: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;

}

// export interface externalSource {
//     sourceType: string;
//     sourceId: string;
//     externalLink: string;
// }