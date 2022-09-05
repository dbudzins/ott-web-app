import { addQueryParams } from 'ott-common/src/utils/formatting';

import type {
  GetPaymentDetails, GetPaymentDetailsPayload,
  GetSubscriptions,
  GetSubscriptionsPayload,
  GetTransactions, GetTransactionsPayload,
  UpdateSubscription, UpdateSubscriptionPayload
} from '../../types/subscription';

import { patch, get } from './cleeng.service';

export const getSubscriptions: GetSubscriptions = async (payload: GetSubscriptionsPayload, sandbox: boolean, jwt: string) => {
  return get(sandbox, `/customers/${payload.customerId}/subscriptions`, jwt);
};

export const updateSubscription: UpdateSubscription = async (payload: UpdateSubscriptionPayload, sandbox: boolean, jwt: string) => {
  return patch(sandbox, `/customers/${payload.customerId}/subscriptions`, JSON.stringify(payload), jwt);
};

export const getPaymentDetails: GetPaymentDetails = async (payload: GetPaymentDetailsPayload, sandbox: boolean, jwt: string) => {
  return get(sandbox, `/customers/${payload.customerId}/payment_details`, jwt);
};

export const getTransactions: GetTransactions = async ({ customerId, limit, offset }: GetTransactionsPayload, sandbox: boolean, jwt: string) => {
  return get(sandbox, addQueryParams(`/customers/${customerId}/transactions`, { limit, offset }), jwt);
};
