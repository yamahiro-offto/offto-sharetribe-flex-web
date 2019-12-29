import unionWith from 'lodash/unionWith';
import { storableError } from '../../util/errors';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { convertUnitToSubUnit, unitDivisor } from '../../util/currency';
import { formatDateStringToUTC, getExclusiveEndDate } from '../../util/dates';
import config from '../../config';

// ================ Action types ================ //

export const SEARCH_LISTINGS_REQUEST = 'app/SearchPage/SEARCH_LISTINGS_REQUEST';
export const SEARCH_LISTINGS_SUCCESS = 'app/SearchPage/SEARCH_LISTINGS_SUCCESS';
export const SEARCH_LISTINGS_ERROR = 'app/SearchPage/SEARCH_LISTINGS_ERROR';

export const SEARCH_MAP_LISTINGS_REQUEST = 'app/SearchPage/SEARCH_MAP_LISTINGS_REQUEST';
export const SEARCH_MAP_LISTINGS_SUCCESS = 'app/SearchPage/SEARCH_MAP_LISTINGS_SUCCESS';
export const SEARCH_MAP_LISTINGS_ERROR = 'app/SearchPage/SEARCH_MAP_LISTINGS_ERROR';

export const SEARCH_MAP_SET_ACTIVE_LISTING = 'app/SearchPage/SEARCH_MAP_SET_ACTIVE_LISTING';

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
  const { type, payload } = action;
  switch (type) {
    case SEARCH_LISTINGS_REQUEST:
      return {
        ...state,
        searchParams: payload.searchParams,
        searchInProgress: true,
        searchMapListingIds: [],
        searchListingsError: null,
      };
    case SEARCH_LISTINGS_SUCCESS:
      return {
        ...state,
        currentPageResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        searchInProgress: false,
      };
    case SEARCH_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, searchInProgress: false, searchListingsError: payload };

    case SEARCH_MAP_LISTINGS_REQUEST:
      return {
        ...state,
        searchMapListingsError: null,
      };
    case SEARCH_MAP_LISTINGS_SUCCESS: {
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
    case SEARCH_MAP_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, searchMapListingsError: payload };

    case SEARCH_MAP_SET_ACTIVE_LISTING:
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
  type: SEARCH_LISTINGS_REQUEST,
  payload: { searchParams },
});

export const searchListingsSuccess = response => ({
  type: SEARCH_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const searchListingsError = e => ({
  type: SEARCH_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const searchMapListingsRequest = () => ({ type: SEARCH_MAP_LISTINGS_REQUEST });

export const searchMapListingsSuccess = response => ({
  type: SEARCH_MAP_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const searchMapListingsError = e => ({
  type: SEARCH_MAP_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const searchListings = searchParams => (dispatch, getState, sdk) => {
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

  return (
    sdk.listings
      .query(params)
      // when listings-query APIs executed, get call user-show APIs
      .then(response => {
        // rename response to distinguish two types of responses
        const listingsResponse = response;
        console.log('listingsResponse', listingsResponse);

        // authorIds of each listing
        const authorIds = listingsResponse.data.data.map(listing => {
          return listing.relationships.author.data.id.uuid; // authorId
        });
        console.log('authorIds', authorIds);

        // make SET to reduce the number of times to call SDK(API)
        const authorIdSet = Array.from(new Set(authorIds));

        // call SDK to get AuthorInfo
        const userResponses = authorIdSet.map(authorId => {
          return sdk.users.show({ id: authorId });
        });

        // return all the resonses(both of listings-query-API and user-show-APIs)
        return Promise.all([listingsResponse, ...userResponses]);
      })
      // when user-show APIs executed, set AuthorInfo to data in listingsRespose
      .then(responses => {
        // set authorInfo to corresponding listingsResponses
        const [listingsResponse, ...userResponses] = responses;

        userResponses.forEach(userResponse => {
          const authorId = userResponse.data.data.id.uuid;

          // add AuthorInfo to data(listing)
          listingsResponse.data.data
            .filter(listing => {
              // listings whose author is the same as user-show response
              return listing.relationships.author.data.id.uuid === authorId;
            })
            .forEach(listing => {
              // set AuthorInfo to data in listings
              listing.relationships.author.data = userResponse.data.data;
            });

          // add AuthorInfo to included(user)
          listingsResponse.data.included
            .filter(entity => {
              // listings whose author is the same as user-show response
              return entity.type === 'user' && entity.id.uuid === authorId;
            })
            .forEach(entity => {
              // set AuthorInfo to data in listings
              entity.attributes = userResponse.data.data.attributes;
            });
        });

        // call action-creator, and dispatch the action to store
        dispatch(addMarketplaceEntities(listingsResponse));
        dispatch(searchListingsSuccess(listingsResponse));
        return listingsResponse;
      })
      .catch(e => {
        dispatch(searchListingsError(storableError(e)));
        throw e;
      })
  );
};

export const setActiveListing = listingId => ({
  type: SEARCH_MAP_SET_ACTIVE_LISTING,
  payload: listingId,
});

export const searchMapListings = searchParams => (dispatch, getState, sdk) => {
  dispatch(searchMapListingsRequest(searchParams));

  const { perPage, ...rest } = searchParams;
  const params = {
    ...rest,
    per_page: perPage,
  };

  return sdk.listings
    .query(params)
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      dispatch(searchMapListingsSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(searchMapListingsError(storableError(e)));
      throw e;
    });
};
