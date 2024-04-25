export interface customer {
    name: string,
    billingAddress: billingAddress,
    shippingAddress: shippingAddress,
    contacts: contacts[]
}

export interface billingAddress{
    streetAddress: string;
    //subAddress: string;
    city: string;
    region: string;
    //regionIso: string;
    postalCode: string;
    country: string;
    //countryIso: string;
}

export interface shippingAddress{
    streetAddress: string;
    //subAddress: string;
    city: string;
    region: string;
    //regionIso: string;
    postalCode: string;
    country: string;
    //countryIso: string;

}

export interface contacts{
    firstName: string;
    lastName: string;
    email: string;
    isBillingContact: boolean;
}