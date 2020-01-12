import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { ListingLink } from '../../components';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { EditListingDetailinfoForm } from '../../forms';
import config from '../../config';
import * as offtoData from '../../util/offtoData';

import css from './EditListingDetailinfoPanel.css';

const EditListingDetailinfoPanel = props => {
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

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingDetailinfoPanel.title"
      values={{ listingTitle: <ListingLink listing={listing} /> }}
    />
  ) : (
    <FormattedMessage id="EditListingDetailinfoPanel.createListingTitle" />
  );

  const _currentListingAttributes = new offtoData.OfftoListingAttributes(currentListing.attributes);
  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingDetailinfoForm
        className={css.form}
        currentListing={currentListing}
        initialValues={{
          title: _currentListingAttributes.title,
          gearId: _currentListingAttributes.publicData.gearId,
          activityType: _currentListingAttributes.publicData.activityType,
          size: _currentListingAttributes.publicData.size,
          skill: _currentListingAttributes.publicData.skill,
          age: _currentListingAttributes.publicData.age,
          gender: _currentListingAttributes.publicData.gender,
          color: _currentListingAttributes.publicData.color,
          condition: _currentListingAttributes.publicData.condition,
          description: _currentListingAttributes.description,
        }}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          const { title, description, ...publicDataAttributes } = values;
          const updateValues = {
            title,
            description,
            publicData: { ...publicDataAttributes },
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

EditListingDetailinfoPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditListingDetailinfoPanel.propTypes = {
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

export default EditListingDetailinfoPanel;
