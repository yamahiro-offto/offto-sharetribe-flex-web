import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { ListingLink } from '../../components';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { EditListingAdditionalitemForm } from '../../forms';
import config from '../../config';
import * as offtoData from '../../util/offtoData';

import css from './EditListingAdditionalitemPanel.css';

const EditListingAdditionalitemPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    currentUser,
    disabled,
    ready,
    onSubmit,
    onChange,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingAdditionalitemPanel.title"
      values={{ listingTitle: <ListingLink listing={listing} /> }}
    />
  ) : (
    <FormattedMessage id="EditListingAdditionalitemPanel.createListingTitle" />
  );

  const _currentListingAttributes = new offtoData.OfftoListingAttributes(currentListing.attributes);
  console.log('_currentListingAttributes', _currentListingAttributes);
  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingAdditionalitemForm
        className={css.form}
        currentListing={currentListing}
        currentUser={currentUser}
        initialValues={{
          additionalItem: _currentListingAttributes.publicData.additionalItem || [],
        }}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          const { additionalItem } = values;
          console.log('values', values);
          console.log('additionalItem', additionalItem);
          const updateValues = {
            publicData: {
              additionalItem,
            },
          };
          console.log('updateValues', updateValues);

          onSubmit(updateValues);
        }}
        onChange={onChange}
        disabled={disabled}
        ready={ready}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        fetchErrors={errors}
        categories={config.custom.categories}
      />
    </div>
  );
};

EditListingAdditionalitemPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditListingAdditionalitemPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingAdditionalitemPanel;
