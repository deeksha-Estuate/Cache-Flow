export interface stripeSubscription {
  id: string;
  customerId: string;
  customerSource: string;

  // proposal data
  proposalName: string;
  startDate: string;
  termType: "month" | "quarter" | "halfyear" | "year" | "";
  termLength: number;
  autoRenewable: boolean;
  autoRenewalTermLength?: number;
  customTerms: string;

  // contract data
  skipContract: boolean;
  contractStatus: "active" | "paused";
  markPastSchedulesAsPaid: boolean;
  paymentMethodId?: string;
  paymentMethodType?: "cc" | "direct_debit";
  paymentMethodSource?: "cacheflow" | "stripe";

  // product data
  productId: string;
  productName: string;
  productPrice: number;
  productQuantity: number;
}

export interface loginRequest {
  subject: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface externalSource {
  sourceType: string;
  sourceId: string;
}

export interface migrationRequest {
  subscriptionId?: string;
  autoRenewable?: boolean;
  autoRenewalTermLength?: number;

  externalCustomerId?: string;
  customerId?: string;

  createProposalRequest?: createProposalRequest;

  skipContract?: boolean;
  contractOptions?: contractOptions;
}

export interface createProposalRequest {
  name: string;
  externalId: string;
  termType?: "month" | "quarter" | "halfyear" | "year";
  termQty?: number;
  startDate?: string;
  autoRenewable?: boolean;
  autoRenewalTermLength?: number;
  customTerms?: string;
  proposalItems?: proposalItem[];
  externalSource?: externalSource;
}

export interface contractOptions {
  contractStatus?: "active" | "paused";
  markPastSchedulesAsPaid?: boolean;
  paymentMethodId?: string;
  paymentMethodType?: "cc" | "direct_debit";
  paymentMethodSource?: "cacheflow" | "stripe";
}

export interface proposalItem {
  productId: string;
  name?: string;
  quantity?: number;
  overrides?: proposalItemOverrides[];
}

export interface money {
  amount: number;
  currency: string;
}

export interface proposalItemOverrides {
  billingPeriod?: "month" | "quarter" | "halfyear" | "year";
  price: money;
  discount: boolean;
}

export interface convertRequest {
  proposalId: string;
  contractOptions?: contractOptions;
}

export interface migrationResponse {}
