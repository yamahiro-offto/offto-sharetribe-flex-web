import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';
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
  console.log('_currentListingAttributes', _currentListingAttributes);
  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingDetailinfoForm
        className={css.form}
        currentListing={currentListing}
        initialValues={{
          ..._currentListingAttributes.publicData.detailInfo,
        }}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          const { ...detailInfo } = values;
          const updateValues = {
            publicData: {
              detailInfo: {
                ...detailInfo,
                length: new Number(detailInfo.length),
                radius: new Number(detailInfo.radius),
                widthHead: new Number(detailInfo.widthHead),
                widthWaist: new Number(detailInfo.widthWaist),
                widthTail: new Number(detailInfo.widthTail),
                modelYear: new Number(detailInfo.modelYear),
              },
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
