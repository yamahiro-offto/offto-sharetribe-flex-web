import config from '../config';
import { types as sdkTypes } from './sdkLoader';
import { nightsBetween, daysBetween } from './dates';
import { LINE_ITEM_NIGHT, formatLineItemAdditionalItem } from './types';

const { Money } = sdkTypes;

export const customPricingParams = (params: any) => {
  const {
    bookingData,
    bookingDates,
    listing,
    selectedAdditionalItemIdQuantities,
    ...rest
  } = params;

  const { bookingStart, bookingEnd } = bookingDates;
  // const listingId = listing.id;

  // Convert picked date to date that will be converted on the API as
  // a noon of correct year-month-date combo in UTC
  // const bookingStartForAPI = dateFromLocalToAPI(bookingStart);
  // const bookingEndForAPI = dateFromLocalToAPI(bookingEnd);

  // Fetch speculated transaction for showing price in booking breakdown
  // NOTE: if unit type is line-item/units, quantity needs to be added.
  // The way to pass it to checkout page is through pageData.bookingData

  // const { bookingStart, bookingEnd, listing, ...rest } = params;
  const { amount, currency } = listing.attributes.price;

  const unitType = config.bookingUnitType;
  const isNightly = unitType === LINE_ITEM_NIGHT;

  const quantity = isNightly
    ? nightsBetween(bookingStart, bookingEnd)
    : daysBetween(bookingStart, bookingEnd);

  const lineItem_listing = {
    code: unitType,
    unitPrice: new Money(amount, currency),
    quantity,
  };

  const lineItems_additionalItems = selectedAdditionalItemIdQuantities
    ? selectedAdditionalItemIdQuantities.map((idQuantity: any) => ({
        code: formatLineItemAdditionalItem(idQuantity.id),
        // includeFor: ['customer', 'provider'],
        unitPrice: new Money(idQuantity.item.price.amount, idQuantity.item.price.currency),
        quantity: idQuantity.quantity,
        // reversal: false,
      }))
    : [];

  console.log('lineItem_listing', lineItem_listing);
  console.log('lineItems_additionalItems', lineItems_additionalItems);

  return {
    listingId: listing.id,
    bookingStart,
    bookingEnd,
    lineItems: [lineItem_listing, ...lineItems_additionalItems],
    selectedAdditionalItemIdQuantities,
    ...rest,
  };
};
