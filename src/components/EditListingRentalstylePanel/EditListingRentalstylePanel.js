import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { ListingLink } from '../../components';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { EditListingRentalstyleForm } from '../../forms';
import config from '../../config';

import css from './EditListingRentalstylePanel.css';

const EditListingRentalstylePanel = props => {
  const {
    className,
    rootClassName,
    listing,
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
  const { publicData } = currentListing.attributes;

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingRentalstylePanel.title"
      values={{ listingTitle: <ListingLink listing={listing} /> }}
    />
  ) : (
    <FormattedMessage id="EditListingRentalstylePanel.createListingTitle" />
  );

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingRentalstyleForm
        className={css.form}
        initialValues={{ activity: publicData.activity }}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          const { activity } = values;
          const updateValues = {
            publicData: { activity },
          };

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

EditListingRentalstylePanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditListingRentalstylePanel.propTypes = {
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

export default EditListingRentalstylePanel;
