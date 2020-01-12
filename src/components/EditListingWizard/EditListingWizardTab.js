import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from '../../util/reactIntl';
import routeConfiguration from '../../routeConfiguration';
import {
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_NEW,
  LISTING_PAGE_PARAM_TYPES,
} from '../../util/urlHelpers';
import { ensureListing } from '../../util/data';
import { createResourceLocatorString } from '../../util/routes';
import {
  EditListingActivityPanel,
  EditListingAvailabilityPanel,
  EditListingDescriptionPanel,
  EditListingFeaturesPanel,
  EditListingLocationPanel,
  EditListingPhotosPanel,
  EditListingPoliciesPanel,
  EditListingPricingPanel,
  EditListingRentalstylePanel,
  EditListingBasicinfoPanel,
  EditListingDetailinfoPanel,
  EditListingAdditionalitemPanel,
  // [ADD_EDITLISTINGPANEL_HERE] NOTE: Do not delete this line. Used by misc/copyEditLisingPanelAndForm.py
} from '../../components';

import css from './EditListingWizard.css';
import { stringifyDateToISO8601 } from '../../util/dates';

// All chars must be lower case.
// EditListingWizard.tabLabel{*} in src/translation/--.json must be the same
// with first charactor uppercased (captalized).
// (related in src/components/EditListingWizard/EditListingWizardTab.js > createNextButtonText())
export const AVAILABILITY = 'availability';
export const DESCRIPTION = 'description';
export const FEATURES = 'features';
export const POLICY = 'policy';
export const LOCATION = 'location';
export const PRICING = 'pricing';
export const PHOTOS = 'photos';
export const ACTIVITY = 'activity';
export const RENTALSTYLE = 'rentalstyle';
export const BASICINFO = 'basicinfo';
export const DETAILINFO = 'detailinfo';
export const ADDITIONALITEM = 'additionalitem';
// [ADD_EDITLISTINGIDENTIFIER_HERE] NOTE: Do not delete this line. Used by misc/copyEditLisingPanelAndForm.py

// EditListingWizardTab component supports these tabs
export const SUPPORTED_TABS = [
  DESCRIPTION,
  FEATURES,
  POLICY,
  LOCATION,
  PRICING,
  AVAILABILITY,
  PHOTOS,
  ACTIVITY,
  RENTALSTYLE,
  BASICINFO,
  DETAILINFO,
  ADDITIONALITEM,
  // [ADD_SUPPORTEDTAB_HERE] NOTE: Do not delete this line. Used by misc/copyEditLisingPanelAndForm.py
];

const pathParamsToNextTab = (params, tab, marketplaceTabs) => {
  const nextTabIndex = marketplaceTabs.findIndex(s => s === tab) + 1;
  const nextTab =
    nextTabIndex < marketplaceTabs.length
      ? marketplaceTabs[nextTabIndex]
      : marketplaceTabs[marketplaceTabs.length - 1];
  return { ...params, tab: nextTab };
};

// When user has update draft listing, he should be redirected to next EditListingWizardTab
const redirectAfterDraftUpdate = (listingId, params, tab, marketplaceTabs, history) => {
  const currentPathParams = {
    ...params,
    type: LISTING_PAGE_PARAM_TYPE_DRAFT,
    id: listingId,
  };
  const routes = routeConfiguration();

  // Replace current "new" path to "draft" path.
  // Browser's back button should lead to editing current draft instead of creating a new one.
  if (params.type === LISTING_PAGE_PARAM_TYPE_NEW) {
    const draftURI = createResourceLocatorString('EditListingPage', routes, currentPathParams, {});
    history.replace(draftURI);
  }

  // Redirect to next tab
  const nextPathParams = pathParamsToNextTab(currentPathParams, tab, marketplaceTabs);
  const to = createResourceLocatorString('EditListingPage', routes, nextPathParams, {});
  history.push(to);
};

const EditListingWizardTab = props => {
  const {
    tab,
    marketplaceTabs,
    params,
    errors,
    fetchInProgress,
    newListingPublished,
    history,
    images,
    availability,
    listing,
    currentUser,
    handleCreateFlowTabScrolling,
    handlePublishListing,
    onUpdateListing,
    onCreateListingDraft,
    onImageUpload,
    onUpdateImageOrder,
    onRemoveImage,
    onChange,
    updatedTab,
    updateInProgress,
    isLastTab,
    intl,
  } = props;

  const { type } = params;
  const isNewURI = type === LISTING_PAGE_PARAM_TYPE_NEW;
  const isDraftURI = type === LISTING_PAGE_PARAM_TYPE_DRAFT;
  const isNewListingFlow = isNewURI || isDraftURI;

  const currentListing = ensureListing(listing);
  const imageIds = images => {
    return images ? images.map(img => img.imageId || img.id) : null;
  };

  const onCompleteEditListingWizardTab = (tab, updateValues) => {
    // Normalize images for API call
    updateValues = { title: '(no title)', ...updateValues };
    const { images: updatedImages, ...otherValues } = updateValues;
    const imageProperty =
      typeof updatedImages !== 'undefined' ? { images: imageIds(updatedImages) } : {};
    const updateValuesWithImages = { ...otherValues, ...imageProperty };

    if (isNewListingFlow) {
      const onUpsertListingDraft = isNewURI
        ? (tab, updateValues) => onCreateListingDraft(updateValues)
        : onUpdateListing;

      const upsertValues = isNewURI
        ? updateValuesWithImages
        : { ...updateValuesWithImages, id: currentListing.id };

      onUpsertListingDraft(tab, upsertValues)
        .then(r => {
          if (tab !== marketplaceTabs[marketplaceTabs.length - 1]) {
            // Create listing flow: smooth scrolling polyfill to scroll to correct tab
            handleCreateFlowTabScrolling(false);

            // After successful saving of draft data, user should be redirected to next tab
            redirectAfterDraftUpdate(r.data.data.id.uuid, params, tab, marketplaceTabs, history);
          } else {
            handlePublishListing(currentListing.id);
          }
        })
        .catch(e => {
          // No need for extra actions
        });
    } else {
      onUpdateListing(tab, { ...updateValuesWithImages, id: currentListing.id });
    }
  };

  const panelProps = tab => {
    return {
      className: css.panel,
      errors,
      listing,
      currentUser,
      onChange,
      panelUpdated: updatedTab === tab,
      updateInProgress,
      // newListingPublished and fetchInProgress are flags for the last wizard tab
      ready: newListingPublished,
      disabled: fetchInProgress,
    };
  };

  const createNextButtonText = (tab, marketplaceTabs, isNewListingFlow, isLastTab) => {
    const capitalizeFirstLetter = str => {
      return str && str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    };
    const tabLabel = intl.formatMessage({
      id: `EditListingWizard.tabLabel${capitalizeFirstLetter(tab)}`,
    });

    if (isNewListingFlow) {
      if (!isLastTab) {
        const nextTab = marketplaceTabs[marketplaceTabs.indexOf(tab) + 1];
        const nextTabLabel = intl.formatMessage({
          id: `EditListingWizard.tabLabel${capitalizeFirstLetter(nextTab)}`,
        });

        // In creating a new listing, and editing not last tab, "Next {nextTabLebel}"
        return intl.formatMessage(
          {
            id: 'EditListingWizard.saveNewNotLastTab',
          },
          {
            nextTabLabel,
          }
        );
      } else {
        // In creating a new listing, and editing the last tab, "Publish listing"
        return intl.formatMessage({ id: 'EditListingWizard.saveNewLastTab' });
      }
    } else {
      // In creating a already-exist listing, "Save {tabLabel}"
      return intl.formatMessage({ id: 'EditListingWizard.saveEditTab' }, { tabLabel: tabLabel });
    }
  };

  switch (tab) {
    case DESCRIPTION: {
      return (
        <EditListingDescriptionPanel
          {...panelProps(DESCRIPTION)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case FEATURES: {
      return (
        <EditListingFeaturesPanel
          {...panelProps(FEATURES)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case POLICY: {
      return (
        <EditListingPoliciesPanel
          {...panelProps(POLICY)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case LOCATION: {
      return (
        <EditListingLocationPanel
          {...panelProps(LOCATION)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case PRICING: {
      return (
        <EditListingPricingPanel
          {...panelProps(PRICING)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case AVAILABILITY: {
      return (
        <EditListingAvailabilityPanel
          {...panelProps(AVAILABILITY)}
          availability={availability}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case PHOTOS: {
      return (
        <EditListingPhotosPanel
          {...panelProps(PHOTOS)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          images={images}
          onImageUpload={onImageUpload}
          onRemoveImage={onRemoveImage}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
          onUpdateImageOrder={onUpdateImageOrder}
        />
      );
    }
    case ACTIVITY: {
      return (
        <EditListingActivityPanel
          {...panelProps(ACTIVITY)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case RENTALSTYLE: {
      return (
        <EditListingRentalstylePanel
          {...panelProps(RENTALSTYLE)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case BASICINFO: {
      return (
        <EditListingBasicinfoPanel
          {...panelProps(BASICINFO)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case DETAILINFO: {
      return (
        <EditListingDetailinfoPanel
          {...panelProps(DETAILINFO)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case ADDITIONALITEM: {
      return (
        <EditListingAdditionalitemPanel
          {...panelProps(ADDITIONALITEM)}
          submitButtonText={createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    // [ADD_TABCASE_HERE] NOTE: Do not delete this line. Used by misc/copyEditLisingPanelAndForm.py
    default:
      return null;
  }
};

EditListingWizardTab.defaultProps = {
  listing: null,
  updatedTab: null,
};

const { array, bool, func, object, oneOf, shape, string } = PropTypes;

EditListingWizardTab.propTypes = {
  params: shape({
    id: string.isRequired,
    slug: string.isRequired,
    type: oneOf(LISTING_PAGE_PARAM_TYPES).isRequired,
    tab: oneOf(SUPPORTED_TABS).isRequired,
  }).isRequired,
  errors: shape({
    createListingDraftError: object,
    publishListingError: object,
    updateListingError: object,
    showListingsError: object,
    uploadImageError: object,
  }).isRequired,
  fetchInProgress: bool.isRequired,
  newListingPublished: bool.isRequired,
  history: shape({
    push: func.isRequired,
    replace: func.isRequired,
  }).isRequired,
  images: array.isRequired,
  availability: object.isRequired,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: shape({
    attributes: shape({
      publicData: object,
      description: string,
      geolocation: object,
      pricing: object,
      title: string,
    }),
    images: array,
  }),

  handleCreateFlowTabScrolling: func.isRequired,
  handlePublishListing: func.isRequired,
  onUpdateListing: func.isRequired,
  onCreateListingDraft: func.isRequired,
  onImageUpload: func.isRequired,
  onUpdateImageOrder: func.isRequired,
  onRemoveImage: func.isRequired,
  onChange: func.isRequired,
  updatedTab: string,
  updateInProgress: bool.isRequired,

  intl: intlShape.isRequired,
};

export default EditListingWizardTab;
