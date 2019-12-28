import unionWith from 'lodash/unionWith';
import { storableError } from '../../util/errors';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { convertUnitToSubUnit, unitDivisor } from '../../util/currency';
import { formatDateStringToUTC, getExclusiveEndDate } from '../../util/dates';
import config from '../../config';

// ================ Action types ================ //

export const TEST_LISTINGS_REQUEST = 'app/TestPage/TEST_LISTINGS_REQUEST';
export const TEST_LISTINGS_SUCCESS = 'app/TestPage/TEST_LISTINGS_SUCCESS';
export const TEST_LISTINGS_ERROR = 'app/TestPage/TEST_LISTINGS_ERROR';

export const TEST_MAP_LISTINGS_REQUEST = 'app/TestPage/TEST_MAP_LISTINGS_REQUEST';
export const TEST_MAP_LISTINGS_SUCCESS = 'app/TestPage/TEST_MAP_LISTINGS_SUCCESS';
export const TEST_MAP_LISTINGS_ERROR = 'app/TestPage/TEST_MAP_LISTINGS_ERROR';

export const TEST_MAP_SET_ACTIVE_LISTING = 'app/TestPage/TEST_MAP_SET_ACTIVE_LISTING';

// ================ Reducer ================ //

const initialState = {
  pagination: null,
  searchParams: null,
  searchInProgress: false,
  searchListingsError: null,
  currentPageResultIds: [],
  searchMapListingIds: [],
  searchMapListingsError: null,
};

const resultIds = data => data.data.map(l => l.id);

const listingPageReducer = (state = initialState, action = {}) => {
  console.log("reducer called", state, action);

  const { type, payload } = action;
  switch (type) {
    case TEST_LISTINGS_REQUEST:
      return {
        ...state,
        searchParams: payload.searchParams,
        searchInProgress: true,
        searchMapListingIds: [],
        searchListingsError: null,
      };
    case TEST_LISTINGS_SUCCESS:
      return {
        ...state,
        currentPageResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        searchInProgress: false,
      };
    case TEST_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, searchInProgress: false, searchListingsError: payload };

    case TEST_MAP_LISTINGS_REQUEST:
      return {
        ...state,
        searchMapListingsError: null,
      };
    case TEST_MAP_LISTINGS_SUCCESS: {
      const searchMapListingIds = unionWith(
        state.searchMapListingIds,
        resultIds(payload.data),
        (id1, id2) => id1.uuid === id2.uuid
      );
      return {
        ...state,
        searchMapListingIds,
      };
    }
    case TEST_MAP_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, searchMapListingsError: payload };

    case TEST_MAP_SET_ACTIVE_LISTING:
      return {
        ...state,
        activeListingId: payload,
      };
    default:
      return state;
  }
};

export default listingPageReducer;

// ================ Action creators ================ //

export const searchListingsRequest = searchParams => ({
  type: TEST_LISTINGS_REQUEST,
  payload: { searchParams },
});

export const searchListingsSuccess = response => ({
  type: TEST_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const searchListingsError = e => ({
  type: TEST_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const searchMapListingsRequest = () => ({ type: TEST_MAP_LISTINGS_REQUEST });

export const searchMapListingsSuccess = response => ({
  type: TEST_MAP_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const searchMapListingsError = e => ({
  type: TEST_MAP_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const searchListings = searchParams => (dispatch, getState, sdk) => {
  console.log("searchListings called");
  dispatch(searchListingsRequest(searchParams));

  const priceSearchParams = priceParam => {
    const inSubunits = value =>
      convertUnitToSubUnit(value, unitDivisor(config.currencyConfig.currency));
    const values = priceParam ? priceParam.split(',') : [];
    return priceParam && values.length === 2
      ? {
          price: [inSubunits(values[0]), inSubunits(values[1]) + 1].join(','),
        }
      : {};
  };

  const datesSearchParams = datesParam => {
    const values = datesParam ? datesParam.split(',') : [];
    const hasValues = datesParam && values.length === 2;
    const startDate = hasValues ? values[0] : null;
    const isNightlyBooking = config.bookingUnitType === 'line-item/night';
    const endDate =
      hasValues && isNightlyBooking ? values[1] : hasValues ? getExclusiveEndDate(values[1]) : null;

    return hasValues
      ? {
          start: formatDateStringToUTC(startDate),
          end: formatDateStringToUTC(endDate),
          // Availability can be full or partial. Default value is full.
          availability: 'full',
        }
      : {};
  };

  const { perPage, price, dates, ...rest } = searchParams;
  const priceMaybe = priceSearchParams(price);
  const datesMaybe = datesSearchParams(dates);

  const params = {
    ...rest,
    ...priceMaybe,
    ...datesMaybe,
    per_page: perPage,
  };

  return sdk.listings
    .query(params)
    .then(response => {
      console.log("searchListings queary succeeded");
      dispatch(addMarketplaceEntities(response));
      dispatch(searchListingsSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(searchListingsError(storableError(e)));
      throw e;
    });
};

export const setActiveListing = listingId => ({
  type: TEST_MAP_SET_ACTIVE_LISTING,
  payload: listingId,
});

export const searchMapListings = searchParams => (dispatch, getState, sdk) => {
  console.log("searchMapListings called");
  dispatch(searchMapListingsRequest(searchParams));

  const { perPage, ...rest } = searchParams;
  const params = {
    ...rest,
    per_page: perPage,
  };

  return sdk.listings
    .query(params)
    .then(response => {
      console.log("searchMapListings queary succeeded");
      dispatch(addMarketplaceEntities(response));
      dispatch(searchMapListingsSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(searchMapListingsError(storableError(e)));
      throw e;
    });
};
