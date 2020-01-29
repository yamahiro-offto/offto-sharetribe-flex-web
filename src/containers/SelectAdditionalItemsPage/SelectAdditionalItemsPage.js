import React, { Component } from 'react';
import { bool, func, instanceOf, object, oneOfType, shape, string } from 'prop-types';
import { compose, combineReducers } from 'redux';
import { connect } from 'react-redux';
import Decimal from 'decimal.js';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import config from '../../config';
import routeConfiguration from '../../routeConfiguration';
import { createResourceLocatorString, findRouteByRouteName } from '../../util/routes';
import {
  propTypes,
  LINE_ITEM_NIGHT,
  LINE_ITEM_DAY,
  LINE_ITEM_ADDITIONAL_ITEM,
  formatLineItemAdditionalItem,
  DATE_TYPE_DATE,
} from '../../util/types';
import {
  ensureListing,
  ensureCurrentUser,
  ensureUser,
  ensureTransaction,
  ensureBooking,
  ensureStripeCustomer,
  ensurePaymentMethodCard,
} from '../../util/data';
import { dateFromLocalToAPI, minutesBetween, nightsBetween, daysBetween } from '../../util/dates';
import { types as sdkTypes } from '../../util/sdkLoader';
import { createSlug } from '../../util/urlHelpers';
import {
  isTransactionInitiateAmountTooLowError,
  isTransactionInitiateListingNotFoundError,
  isTransactionInitiateMissingStripeAccountError,
  isTransactionInitiateBookingTimeNotAvailableError,
  isTransactionChargeDisabledError,
  isTransactionZeroPaymentError,
  transactionInitiateOrderStripeErrors,
} from '../../util/errors';
import { formatMoney } from '../../util/currency';
import { TRANSITION_ENQUIRE, txIsPaymentPending, txIsPaymentExpired } from '../../util/transaction';
import {
  AvatarMedium,
  BookingBreakdown,
  Logo,
  NamedLink,
  NamedRedirect,
  Page,
  ResponsiveImage,
} from '../../components';
import { EditListingAdditionalitemForm } from '../../forms';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { handleCardPayment, retrievePaymentIntent } from '../../ducks/stripe.duck';
import { savePaymentMethod } from '../../ducks/paymentMethods.duck';

import {
  initiateOrder,
  setInitialValues,
  speculateTransaction,
  stripeCustomer,
  confirmPayment,
  sendMessage,
} from './SelectAdditionalItemsPage.duck';
import { storeData, storedData, clearData } from './SelectAdditionalItemsPageSessionHelpers';
import css from './SelectAdditionalItemsPage.css';
import { OfftoListingAttributes } from '../../util/offtoData';

const { Money } = sdkTypes;

const STORAGE_KEY = 'SelectAdditionalItemsPage';

// Stripe PaymentIntent statuses, where user actions are already completed
// https://stripe.com/docs/payments/payment-intents/status
const STRIPE_PI_USER_ACTIONS_DONE_STATUSES = ['processing', 'requires_capture', 'succeeded'];

// Payment charge options
const ONETIME_PAYMENT = 'ONETIME_PAYMENT';
const PAY_AND_SAVE_FOR_LATER_USE = 'PAY_AND_SAVE_FOR_LATER_USE';
const USE_SAVED_CARD = 'USE_SAVED_CARD';

const paymentFlow = (selectedPaymentMethod, saveAfterOnetimePayment) => {
  // Payment mode could be 'replaceCard', but without explicit saveAfterOnetimePayment flag,
  // we'll handle it as one-time payment
  return selectedPaymentMethod === 'defaultCard'
    ? USE_SAVED_CARD
    : saveAfterOnetimePayment
      ? PAY_AND_SAVE_FOR_LATER_USE
      : ONETIME_PAYMENT;
};

const initializeOrderPage = (initialValues, routes, dispatch) => {
  const OrderPage = findRouteByRouteName('OrderDetailsPage', routes);

  // Transaction is already created, but if the initial message
  // sending failed, we tell it to the OrderDetailsPage.
  dispatch(OrderPage.setInitialValues(initialValues));
};

const checkIsPaymentExpired = existingTransaction => {
  return txIsPaymentExpired(existingTransaction)
    ? true
    : txIsPaymentPending(existingTransaction)
      ? minutesBetween(existingTransaction.attributes.lastTransitionedAt, new Date()) >= 15
      : false;
};

export class SelectAdditionalItemsPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pageData: {},
      dataLoaded: false,
      submitting: false,
      selectedAdditionalItemIdQuantities: null,
    };
    this.stripe = null;

    this.onStripeInitialized = this.onStripeInitialized.bind(this);
    this.loadInitialData = this.loadInitialData.bind(this);
    this.handlePaymentIntent = this.handlePaymentIntent.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (window) {
      this.loadInitialData();
    }
  }

  customPricingParams(params) {
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
      ? selectedAdditionalItemIdQuantities.map(idQuantity => ({
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
      ...rest,
    };
  }

  // Browser's back navigation should not rewrite data in session store.
  setTransactionValues() {
    const { bookingData, bookingDates, listing, transaction, history } = this.props;

    // Action is 'POP' on both history.back() and page refresh cases.
    // Action is 'PUSH' when user has directed through a link
    // Action is 'REPLACE' when user has directed through login/signup process
    const hasNavigatedThroughLink = history.action === 'PUSH' || history.action === 'REPLACE';
    const hasDataInProps = !!(bookingData && bookingDates && listing) && hasNavigatedThroughLink;

    if (hasDataInProps) {
      // Store data only if data is passed through props and user has navigated through a link.
      storeData(bookingData, bookingDates, listing, transaction, STORAGE_KEY);
    }
  }

  getTransactionValues() {
    const { bookingData, bookingDates, listing, speculatedTransaction, history } = this.props;

    const hasNavigatedThroughLink = history.action === 'PUSH' || history.action === 'REPLACE';
    const hasDataInProps = !!(bookingData && bookingDates && listing) && hasNavigatedThroughLink;

    return hasDataInProps
      ? { bookingData, bookingDates, listing, speculatedTransaction }
      : storedData(STORAGE_KEY);
  }

  /**
   * Load initial data for the page
   *
   * Since the data for the checkout is not passed in the URL (there
   * might be lots of options in the future), we must pass in the data
   * some other way. Currently the ListingPage sets the initial data
   * for the SelectAdditionalItemsPage's Redux store.
   *
   * For some cases (e.g. a refresh in the SelectAdditionalItemsPage), the Redux
   * store is empty. To handle that case, we store the received data
   * to window.sessionStorage and read it from there if no props from
   * the store exist.
   *
   * This function also sets of fetching the speculative transaction
   * based on this initial data.
   */
  loadInitialData(selectedAdditionalItemIdQuantities = null) {
    const {
      bookingData,
      bookingDates,
      listing,
      transaction,
      fetchSpeculatedTransaction,
      fetchStripeCustomer,
      history,
    } = this.props;

    this.selectedAdditionalItemIdQuantities = selectedAdditionalItemIdQuantities;

    // Fetch currentUser with stripeCustomer entity
    // Note: since there's need for data loading in "componentWillMount" function,
    //       this is added here instead of loadData static function.
    fetchStripeCustomer();

    this.setTransactionValues();

    // NOTE: stored data can be empty if user has already successfully completed transaction.
    const pageData = this.getTransactionValues();

    // Check if a booking is already created according to stored data.
    const tx = pageData ? pageData.speculatedTransaction : null;
    const isBookingCreated = tx && tx.booking && tx.booking.id;

    const shouldFetchSpeculatedTransaction =
      selectedAdditionalItemIdQuantities || // force to fetch
      (pageData &&
        pageData.listing &&
        pageData.listing.id &&
        pageData.bookingData &&
        pageData.bookingDates &&
        pageData.bookingDates.bookingStart &&
        pageData.bookingDates.bookingEnd &&
        !isBookingCreated);

    if (shouldFetchSpeculatedTransaction) {
      const transactionParams = this.customPricingParams({
        ...pageData,
        selectedAdditionalItemIdQuantities,
      });

      console.log('transactionParams', transactionParams);

      fetchSpeculatedTransaction({
        transactionParams,
        selectedAdditionalItemIdQuantities,
      });
    }

    this.setState({ pageData: pageData || {}, dataLoaded: true });
  }

  handlePaymentIntent(handlePaymentParams) {
    const {
      currentUser,
      stripeCustomerFetched,
      onInitiateOrder,
      onHandleCardPayment,
      onConfirmPayment,
      onSendMessage,
      onSavePaymentMethod,
    } = this.props;
    const {
      pageData,
      speculatedTransaction,
      message,
      paymentIntent,
      selectedPaymentMethod,
      saveAfterOnetimePayment,
    } = handlePaymentParams;
    const storedTx = ensureTransaction(pageData.transaction);

    const ensuredCurrentUser = ensureCurrentUser(currentUser);
    const ensuredStripeCustomer = ensureStripeCustomer(ensuredCurrentUser.stripeCustomer);
    const ensuredDefaultPaymentMethod = ensurePaymentMethodCard(
      ensuredStripeCustomer.defaultPaymentMethod
    );

    let createdPaymentIntent = null;

    const hasDefaultPaymentMethod = !!(
      stripeCustomerFetched &&
      ensuredStripeCustomer.attributes.stripeCustomerId &&
      ensuredDefaultPaymentMethod.id
    );
    const stripePaymentMethodId = hasDefaultPaymentMethod
      ? ensuredDefaultPaymentMethod.attributes.stripePaymentMethodId
      : null;

    const selectedPaymentFlow = paymentFlow(selectedPaymentMethod, saveAfterOnetimePayment);

    // Step 1: initiate order by requesting payment from Marketplace API
    const fnRequestPayment = fnParams => {
      // fnParams should be { listingId, bookingStart, bookingEnd }
      const hasPaymentIntents =
        storedTx.attributes.protectedData && storedTx.attributes.protectedData.stripePaymentIntents;

      // If paymentIntent exists, order has been initiated previously.
      return hasPaymentIntents ? Promise.resolve(storedTx) : onInitiateOrder(fnParams, storedTx.id);
    };

    // Step 2: pay using Stripe SDK
    const fnHandleCardPayment = fnParams => {
      // fnParams should be returned transaction entity

      const order = ensureTransaction(fnParams);
      if (order.id) {
        // Store order.
        const { bookingData, bookingDates, listing } = pageData;
        storeData(bookingData, bookingDates, listing, order, STORAGE_KEY);
        this.setState({ pageData: { ...pageData, transaction: order } });
      }

      const hasPaymentIntents =
        order.attributes.protectedData && order.attributes.protectedData.stripePaymentIntents;

      if (!hasPaymentIntents) {
        throw new Error(
          `Missing StripePaymentIntents key in transaction's protectedData. Check that your transaction process is configured to use payment intents.`
        );
      }

      const { stripePaymentIntentClientSecret } = hasPaymentIntents
        ? order.attributes.protectedData.stripePaymentIntents.default
        : null;

      const { stripe, card, billingDetails, paymentIntent } = handlePaymentParams;
      const stripeElementMaybe = selectedPaymentFlow !== USE_SAVED_CARD ? { card } : {};

      // Note: payment_method could be set here for USE_SAVED_CARD flow.
      // { payment_method: stripePaymentMethodId }
      // However, we have set it already on API side, when PaymentIntent was created.
      const paymentParams =
        selectedPaymentFlow !== USE_SAVED_CARD
          ? {
            payment_method_data: {
              billing_details: billingDetails,
            },
          }
          : {};

      const params = {
        stripePaymentIntentClientSecret,
        orderId: order.id,
        stripe,
        ...stripeElementMaybe,
        paymentParams,
      };

      // If paymentIntent status is not waiting user action,
      // handleCardPayment has been called previously.
      const hasPaymentIntentUserActionsDone =
        paymentIntent && STRIPE_PI_USER_ACTIONS_DONE_STATUSES.includes(paymentIntent.status);
      return hasPaymentIntentUserActionsDone
        ? Promise.resolve({ transactionId: order.id, paymentIntent })
        : onHandleCardPayment(params);
    };

    // Step 3: complete order by confirming payment to Marketplace API
    // Parameter should contain { paymentIntent, transactionId } returned in step 2
    const fnConfirmPayment = fnParams => {
      createdPaymentIntent = fnParams.paymentIntent;
      return onConfirmPayment(fnParams);
    };

    // Step 4: send initial message
    const fnSendMessage = fnParams => {
      return onSendMessage({ ...fnParams, message });
    };

    // Step 5: optionally save card as defaultPaymentMethod
    const fnSavePaymentMethod = fnParams => {
      const pi = createdPaymentIntent || paymentIntent;

      if (selectedPaymentFlow === PAY_AND_SAVE_FOR_LATER_USE) {
        return onSavePaymentMethod(ensuredStripeCustomer, pi.payment_method)
          .then(response => {
            if (response.errors) {
              return { ...fnParams, paymentMethodSaved: false };
            }
            return { ...fnParams, paymentMethodSaved: true };
          })
          .catch(e => {
            // Real error cases are catched already in paymentMethods page.
            return { ...fnParams, paymentMethodSaved: false };
          });
      } else {
        return Promise.resolve({ ...fnParams, paymentMethodSaved: true });
      }
    };

    // Here we create promise calls in sequence
    // This is pretty much the same as:
    // fnRequestPayment({...initialParams})
    //   .then(result => fnHandleCardPayment({...result}))
    //   .then(result => fnConfirmPayment({...result}))
    const applyAsync = (acc, val) => acc.then(val);
    const composeAsync = (...funcs) => x => funcs.reduce(applyAsync, Promise.resolve(x));
    const handlePaymentIntentCreation = composeAsync(
      fnRequestPayment,
      fnHandleCardPayment,
      fnConfirmPayment,
      fnSendMessage,
      fnSavePaymentMethod
    );

    // Create order aka transaction
    // NOTE: if unit type is line-item/units, quantity needs to be added.
    // The way to pass it to checkout page is through pageData.bookingData
    const tx = speculatedTransaction ? speculatedTransaction : storedTx;

    // Note: optionalPaymentParams contains Stripe paymentMethod,
    // but that can also be passed on Step 2
    // stripe.handleCardPayment(stripe, { payment_method: stripePaymentMethodId })
    const optionalPaymentParams =
      selectedPaymentFlow === USE_SAVED_CARD && hasDefaultPaymentMethod
        ? { paymentMethod: stripePaymentMethodId }
        : selectedPaymentFlow === PAY_AND_SAVE_FOR_LATER_USE
          ? { setupPaymentMethodForSaving: true }
          : {};

    const orderParams = {
      listingId: pageData.listing.id,
      bookingStart: tx.booking.attributes.start,
      bookingEnd: tx.booking.attributes.end,
      ...optionalPaymentParams,
    };

    return handlePaymentIntentCreation(orderParams);
  }

  handleChange(availableAdditionalItems) {
    return (values, _pre) => {
      const { additionalItemIds: selectedAdditionalItemIds } = values;
      const selectedAdditionalItemIdQuantities = selectedAdditionalItemIds.map(itemId => {
        const idx = availableAdditionalItems.findIndex(item => item.id == itemId);
        return { id: itemId, quantity: 1, item: availableAdditionalItems[idx] };
      });

      // if not renewed, do nothing (may be called when initialValue is changed)
      if (
        this.selectedAdditionalItemIdQuantities &&
        selectedAdditionalItemIdQuantities &&
        this.selectedAdditionalItemIdQuantities.toString() ===
        selectedAdditionalItemIdQuantities.toString()
      ) {
        return;
      }

      this.loadInitialData(selectedAdditionalItemIdQuantities);
    };
  }

  handleSubmit(availableAdditionalItems) {
    return (values, _pre) => {
      console.log('handleSubmit');
      console.log('values', values);
      const { additionalItemIds: selectedAdditionalItemIds } = values;
      const selectedAdditionalItemIdQuantities = selectedAdditionalItemIds.map(itemId => {
        const idx = availableAdditionalItems.findIndex(item => item.id == itemId);
        return { id: itemId, quantity: 1, item: availableAdditionalItems[idx] };
      });

      const {
        listing,
        bookingData,
        bookingDates,
        speculatedTransaction,
      } = this.getTransactionValues();
      const { history, callSetInitialValues } = this.props;

      const initialValues = {
        listing,
        bookingData,
        bookingDates,
        speculatedTransaction,
        selectedAdditionalItemIdQuantities,
      };

      const routes = routeConfiguration();
      const { setInitialValues } = findRouteByRouteName('InputCustomerDetailInfoPage', routes);
      console.log('handleSubmit');

      callSetInitialValues(setInitialValues, initialValues);

      // Redirect to InputCustomerDetailInfo
      history.push(
        createResourceLocatorString(
          'InputCustomerDetailInfoPage',
          routes,
          { id: listing.id.uuid, slug: createSlug(listing.attributes.title) },
          {}
        )
      );
    };
  }

  onStripeInitialized(stripe) {
    this.stripe = stripe;

    const { paymentIntent, onRetrievePaymentIntent } = this.props;
    const tx = this.state.pageData ? this.state.pageData.transaction : null;

    // We need to get up to date PI, if booking is created but payment is not expired.
    const shouldFetchPaymentIntent =
      this.stripe &&
      !paymentIntent &&
      tx &&
      tx.id &&
      tx.booking &&
      tx.booking.id &&
      txIsPaymentPending(tx) &&
      !checkIsPaymentExpired(tx);

    if (shouldFetchPaymentIntent) {
      const { stripePaymentIntentClientSecret } =
        tx.attributes.protectedData && tx.attributes.protectedData.stripePaymentIntents
          ? tx.attributes.protectedData.stripePaymentIntents.default
          : {};

      // Fetch up to date PaymentIntent from Stripe
      onRetrievePaymentIntent({ stripe, stripePaymentIntentClientSecret });
    }
  }

  render() {
    const {
      scrollingDisabled,
      speculateTransactionInProgress,
      speculateTransactionError,
      speculatedTransaction: speculatedTransactionMaybe,
      initiateOrderError,
      confirmPaymentError,
      intl,
      params,
      currentUser,
      selectedAdditionalItemIdQuantities,
      handleCardPaymentError,
      paymentIntent,
      retrievePaymentIntentError,
      stripeCustomerFetched,
    } = this.props;

    // Since the listing data is already given from the ListingPage
    // and stored to handle refreshes, it might not have the possible
    // deleted or closed information in it. If the transaction
    // initiate or the speculative initiate fail due to the listing
    // being deleted or closec, we should dig the information from the
    // errors and not the listing data.
    const listingNotFound =
      isTransactionInitiateListingNotFoundError(speculateTransactionError) ||
      isTransactionInitiateListingNotFoundError(initiateOrderError);

    const isLoading = !this.state.dataLoaded;
    // const isLoading = !this.state.dataLoaded || speculateTransactionInProgress;

    const { listing, bookingDates, transaction } = this.state.pageData;
    const existingTransaction = ensureTransaction(transaction);
    const speculatedTransaction = ensureTransaction(speculatedTransactionMaybe, {}, null);
    const currentListing = ensureListing(listing);
    const currentAuthor = ensureUser(currentListing.author);

    const listingTitle = currentListing.attributes.title;
    const title = intl.formatMessage({ id: 'SelectAdditionalItemsPage.title' }, { listingTitle });

    const pageProps = { title, scrollingDisabled };
    const topbar = (
      <div className={css.topbar}>
        <NamedLink className={css.home} name="LandingPage">
          <Logo
            className={css.logoMobile}
            title={intl.formatMessage({ id: 'SelectAdditionalItemsPage.goToLandingPage' })}
            format="mobile"
          />
          <Logo
            className={css.logoDesktop}
            alt={intl.formatMessage({ id: 'SelectAdditionalItemsPage.goToLandingPage' })}
            format="desktop"
          />
        </NamedLink>
      </div>
    );

    if (isLoading) {
      return <Page {...pageProps}>{topbar}</Page>;
    }

    const isOwnListing =
      currentUser &&
      currentUser.id &&
      currentAuthor &&
      currentAuthor.id &&
      currentAuthor.id.uuid === currentUser.id.uuid;

    const hasListingAndAuthor = !!(currentListing.id && currentAuthor.id);
    const hasBookingDates = !!(
      bookingDates &&
      bookingDates.bookingStart &&
      bookingDates.bookingEnd
    );
    const hasRequiredData = hasListingAndAuthor && hasBookingDates;
    const canShowPage = hasRequiredData && !isOwnListing;
    const shouldRedirect = !isLoading && !canShowPage;

    // Redirect back to ListingPage if data is missing.
    // Redirection must happen before any data format error is thrown (e.g. wrong currency)
    if (shouldRedirect) {
      // eslint-disable-next-line no-console
      console.error('Missing or invalid data for checkout, redirecting back to listing page.', {
        transaction: speculatedTransaction,
        bookingDates,
        listing,
      });
      return <NamedRedirect name="ListingPage" params={params} />;
    }

    // Show breakdown only when speculated transaction and booking are loaded
    // (i.e. have an id)
    const tx = existingTransaction.booking ? existingTransaction : speculatedTransaction;
    const txBooking = ensureBooking(tx.booking);
    const breakdown =
      tx.id && txBooking.id ? (
        <BookingBreakdown
          className={css.bookingBreakdown}
          userRole="customer"
          unitType={config.bookingUnitType}
          transaction={tx}
          booking={txBooking}
          dateType={DATE_TYPE_DATE}
          additionalItems={currentAuthor.attributes.profile.publicData.additionalItems || []}
        />
      ) : null;

    const isPaymentExpired = checkIsPaymentExpired(existingTransaction);
    const hasDefaultPaymentMethod = !!(
      stripeCustomerFetched &&
      ensureStripeCustomer(currentUser.stripeCustomer).attributes.stripeCustomerId &&
      ensurePaymentMethodCard(currentUser.stripeCustomer.defaultPaymentMethod).id
    );

    // Allow showing page when currentUser is still being downloaded,
    // but show payment form only when user info is loaded.
    const showPaymentForm = !!(
      currentUser &&
      hasRequiredData &&
      !listingNotFound &&
      !initiateOrderError &&
      !speculateTransactionError &&
      !retrievePaymentIntentError &&
      !isPaymentExpired
    );

    const firstImage =
      currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

    const listingLink = (
      <NamedLink
        name="ListingPage"
        params={{ id: currentListing.id.uuid, slug: createSlug(listingTitle) }}
      >
        <FormattedMessage id="SelectAdditionalItemsPage.errorlistingLinkText" />
      </NamedLink>
    );

    const isAmountTooLowError = isTransactionInitiateAmountTooLowError(initiateOrderError);
    const isChargeDisabledError = isTransactionChargeDisabledError(initiateOrderError);
    const isBookingTimeNotAvailableError = isTransactionInitiateBookingTimeNotAvailableError(
      initiateOrderError
    );
    const stripeErrors = transactionInitiateOrderStripeErrors(initiateOrderError);

    let initiateOrderErrorMessage = null;
    let listingNotFoundErrorMessage = null;

    if (listingNotFound) {
      listingNotFoundErrorMessage = (
        <p className={css.notFoundError}>
          <FormattedMessage id="SelectAdditionalItemsPage.listingNotFoundError" />
        </p>
      );
    } else if (isAmountTooLowError) {
      initiateOrderErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="SelectAdditionalItemsPage.initiateOrderAmountTooLow" />
        </p>
      );
    } else if (isBookingTimeNotAvailableError) {
      initiateOrderErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="SelectAdditionalItemsPage.bookingTimeNotAvailableMessage" />
        </p>
      );
    } else if (isChargeDisabledError) {
      initiateOrderErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="SelectAdditionalItemsPage.chargeDisabledMessage" />
        </p>
      );
    } else if (stripeErrors && stripeErrors.length > 0) {
      // NOTE: Error messages from Stripes are not part of translations.
      // By default they are in English.
      const stripeErrorsAsString = stripeErrors.join(', ');
      initiateOrderErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage
            id="SelectAdditionalItemsPage.initiateOrderStripeError"
            values={{ stripeErrors: stripeErrorsAsString }}
          />
        </p>
      );
    } else if (initiateOrderError) {
      // Generic initiate order error
      initiateOrderErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage
            id="SelectAdditionalItemsPage.initiateOrderError"
            values={{ listingLink }}
          />
        </p>
      );
    }

    const speculateTransactionErrorMessage = speculateTransactionError ? (
      <p className={css.speculateError}>
        <FormattedMessage id="SelectAdditionalItemsPage.speculateTransactionError" />
      </p>
    ) : null;
    let speculateErrorMessage = null;

    if (isTransactionInitiateMissingStripeAccountError(speculateTransactionError)) {
      speculateErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="SelectAdditionalItemsPage.providerStripeAccountMissingError" />
        </p>
      );
    } else if (isTransactionInitiateBookingTimeNotAvailableError(speculateTransactionError)) {
      speculateErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="SelectAdditionalItemsPage.bookingTimeNotAvailableMessage" />
        </p>
      );
    } else if (isTransactionZeroPaymentError(speculateTransactionError)) {
      speculateErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="SelectAdditionalItemsPage.initiateOrderAmountTooLow" />
        </p>
      );
    } else if (speculateTransactionError) {
      speculateErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="SelectAdditionalItemsPage.speculateFailedMessage" />
        </p>
      );
    }

    const unitType = config.bookingUnitType;
    const isNightly = unitType === LINE_ITEM_NIGHT;
    const isDaily = unitType === LINE_ITEM_DAY;

    const unitTranslationKey = isNightly
      ? 'SelectAdditionalItemsPage.perNight'
      : isDaily
        ? 'SelectAdditionalItemsPage.perDay'
        : 'SelectAdditionalItemsPage.perUnit';

    const price = currentListing.attributes.price;
    const formattedPrice = formatMoney(intl, price);
    const detailsSubTitle = `${formattedPrice} ${intl.formatMessage({ id: unitTranslationKey })}`;

    const showInitialMessageInput = !(
      existingTransaction && existingTransaction.attributes.lastTransition === TRANSITION_ENQUIRE
    );

    // Get first and last name of the current user and use it in the StripePaymentForm to autofill the name field
    const userName =
      currentUser && currentUser.attributes
        ? `${currentUser.attributes.profile.firstName} ${currentUser.attributes.profile.lastName}`
        : null;

    // If paymentIntent status is not waiting user action,
    // handleCardPayment has been called previously.
    const hasPaymentIntentUserActionsDone =
      paymentIntent && STRIPE_PI_USER_ACTIONS_DONE_STATUSES.includes(paymentIntent.status);

    // If your marketplace works mostly in one country you can use initial values to select country automatically
    // e.g. {country: 'FI'}

    const initalValuesForStripePayment = { name: userName };

    // additional items: ones registered in listing's publicData and user's publicData
    const currentOfftoListingAttibutes = new OfftoListingAttributes(currentListing.attributes);
    const listingItemIds = currentOfftoListingAttibutes.publicData.additionalItemIds;
    const userItems = currentAuthor.attributes.profile.publicData.additionalItems;
    const availableAdditionalItems = listingItemIds
      .map(listingItemId => {
        const idx = userItems.findIndex(userItem => userItem.id === listingItemId);
        if (idx >= 0) {
          return userItems[idx];
        } else {
          return null;
        }
      })
      .filter(v => v);

    // addiional items form button
    const additionalItemsButtonText = intl.formatMessage({
      id: 'SelectAdditionalItemsPage.submitButton',
    });

    return (
      <Page {...pageProps}>
        {topbar}
        <div className={css.contentContainer}>
          <div className={css.aspectWrapper}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={listingTitle}
              image={firstImage}
              variants={['landscape-crop', 'landscape-crop2x']}
            />
          </div>
          <div className={classNames(css.avatarWrapper, css.avatarMobile)}>
            <AvatarMedium user={currentAuthor} disableProfileLink />
          </div>
          <div className={css.bookListingContainer}>
            <div className={css.heading}>
              <h1 className={css.title}>
                <FormattedMessage id="SelectAdditionalItemsPage.title" />
              </h1>
              <p>
                <FormattedMessage id="SelectAdditionalItemsPage.subtitle" />
              </p>
            </div>

            <div className={css.priceBreakdownContainer}>
              {speculateTransactionErrorMessage}
              {breakdown}
            </div>

            <section className={css.paymentContainer}>
              {initiateOrderErrorMessage}
              {listingNotFoundErrorMessage}
              {speculateErrorMessage}
              {retrievePaymentIntentError ? (
                <p className={css.orderError}>
                  <FormattedMessage
                    id="SelectAdditionalItemsPage.retrievingStripePaymentIntentFailed"
                    values={{ listingLink }}
                  />
                </p>
              ) : null}
              {showPaymentForm ? (
                <EditListingAdditionalitemForm
                  className={css.form}
                  saveActionMsg={additionalItemsButtonText}
                  initialValues={{
                    additionalItemIds: selectedAdditionalItemIdQuantities
                      ? selectedAdditionalItemIdQuantities.map(idQuantity => idQuantity.id)
                      : [],
                  }}
                  onChange={this.handleChange(availableAdditionalItems)}
                  onSubmit={this.handleSubmit(availableAdditionalItems)}
                  additionalItems={availableAdditionalItems}
                  disabled={false}
                  ready={false}
                  updated={false}
                  updateInProgress={false}
                  fetchErrors={{}}
                />
              ) : null}
              {isPaymentExpired ? (
                <p className={css.orderError}>
                  <FormattedMessage
                    id="SelectAdditionalItemsPage.paymentExpiredMessage"
                    values={{ listingLink }}
                  />
                </p>
              ) : null}
            </section>
          </div>

          <div className={css.detailsContainerDesktop}>
            <div className={css.detailsAspectWrapper}>
              <ResponsiveImage
                rootClassName={css.rootForImage}
                alt={listingTitle}
                image={firstImage}
                variants={['landscape-crop', 'landscape-crop2x']}
              />
            </div>
            <div className={css.avatarWrapper}>
              <AvatarMedium user={currentAuthor} disableProfileLink />
            </div>
            <div className={css.detailsHeadings}>
              <h2 className={css.detailsTitle}>{listingTitle}</h2>
              <p className={css.detailsSubtitle}>{detailsSubTitle}</p>
            </div>
            {speculateTransactionErrorMessage}
            {breakdown}
          </div>
        </div>
      </Page>
    );
  }
}

SelectAdditionalItemsPageComponent.defaultProps = {
  initiateOrderError: null,
  confirmPaymentError: null,
  listing: null,
  bookingData: {},
  bookingDates: null,
  speculateTransactionError: null,
  speculatedTransaction: null,
  transaction: null,
  currentUser: null,
  paymentIntent: null,
};

SelectAdditionalItemsPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  listing: propTypes.listing,
  bookingData: object,
  bookingDates: shape({
    bookingStart: instanceOf(Date).isRequired,
    bookingEnd: instanceOf(Date).isRequired,
  }),
  fetchStripeCustomer: func.isRequired,
  stripeCustomerFetched: bool.isRequired,
  fetchSpeculatedTransaction: func.isRequired,
  speculateTransactionInProgress: bool.isRequired,
  speculateTransactionError: propTypes.error,
  speculatedTransaction: propTypes.transaction,
  transaction: propTypes.transaction,
  currentUser: propTypes.currentUser,
  params: shape({
    id: string,
    slug: string,
  }).isRequired,
  onConfirmPayment: func.isRequired,
  onInitiateOrder: func.isRequired,
  onHandleCardPayment: func.isRequired,
  onRetrievePaymentIntent: func.isRequired,
  onSavePaymentMethod: func.isRequired,
  onSendMessage: func.isRequired,
  initiateOrderError: propTypes.error,
  confirmPaymentError: propTypes.error,
  // handleCardPaymentError comes from Stripe so that's why we can't expect it to be in a specific form
  handleCardPaymentError: oneOfType([propTypes.error, object]),
  paymentIntent: object,

  // from connect
  dispatch: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
};

const mapStateToProps = state => {
  const {
    listing,
    bookingData,
    bookingDates,
    selectedAdditionalItemIdQuantities,
    stripeCustomerFetched,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    transaction,
    initiateOrderError,
    confirmPaymentError,
  } = state.SelectAdditionalItemsPage;
  const { currentUser } = state.user;
  const { handleCardPaymentError, paymentIntent, retrievePaymentIntentError } = state.stripe;
  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    stripeCustomerFetched,
    bookingData,
    bookingDates,
    selectedAdditionalItemIdQuantities,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    transaction,
    listing,
    initiateOrderError,
    handleCardPaymentError,
    confirmPaymentError,
    paymentIntent,
    retrievePaymentIntentError,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchSpeculatedTransaction: params => dispatch(speculateTransaction(params)),
  fetchStripeCustomer: () => dispatch(stripeCustomer()),
  onInitiateOrder: (params, transactionId) => dispatch(initiateOrder(params, transactionId)),
  onRetrievePaymentIntent: params => dispatch(retrievePaymentIntent(params)),
  onHandleCardPayment: params => dispatch(handleCardPayment(params)),
  onConfirmPayment: params => dispatch(confirmPayment(params)),
  onSendMessage: params => dispatch(sendMessage(params)),
  onSavePaymentMethod: (stripeCustomer, stripePaymentMethodId) =>
    dispatch(savePaymentMethod(stripeCustomer, stripePaymentMethodId)),
  callSetInitialValues: (setInitialValues, values) => dispatch(setInitialValues(values)),
});

const SelectAdditionalItemsPage = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(SelectAdditionalItemsPageComponent);

SelectAdditionalItemsPage.setInitialValues = initialValues => setInitialValues(initialValues);

SelectAdditionalItemsPage.displayName = 'SelectAdditionalItemsPage';

export default SelectAdditionalItemsPage;
