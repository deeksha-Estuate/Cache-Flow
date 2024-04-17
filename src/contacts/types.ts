export interface contact {
    firstName: string,
    lastName: string,
    email: string,
    isBillingContact: boolean
}

export interface externalSource {
    sourceType: string;
    sourceId: string;
    externalLink: string;
}