import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { maxLength, required, composeValidators } from '../../util/validators';
import * as offtoData from '../../util/offtoData';
import { Form, Button, FieldSelectCustom } from '../../components';

import css from './EditListingRentalstyleForm.css';

const TITLE_MAX_LENGTH = 60;

const EditListingRentalstyleFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        categories,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
      } = formRenderProps;

      const titleMessage = intl.formatMessage({ id: 'EditListingRentalstyleForm.title' });
      const titlePlaceholderMessage = intl.formatMessage({
        id: 'EditListingRentalstyleForm.titlePlaceholder',
      });
      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingRentalstyleForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingRentalstyleForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      const descriptionMessage = intl.formatMessage({
        id: 'EditListingRentalstyleForm.description',
      });
      const descriptionPlaceholderMessage = intl.formatMessage({
        id: 'EditListingRentalstyleForm.descriptionPlaceholder',
      });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const descriptionRequiredMessage = intl.formatMessage({
        id: 'EditListingRentalstyleForm.descriptionRequired',
      });

      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingRentalstyleForm.updateFailed" />
        </p>
      ) : null;

      // This error happens only on first tab (of EditListingWizard)
      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingRentalstyleForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingRentalstyleForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      const formDivs = {};
      formDivs.activity = (
        <div className={css.sectionContainer}>
          <FieldSelectCustom
            id="activity"
            name="activity" // values の key
            label={'activity'}
            placeholder={'placeholder'}
            validate=""
            // options={[{ key: 'customer', label: 'customer' }, { key: 'shop', label: 'shop' }]}
            options={Object.keys(offtoData.Activity).map(activity => {
              return {
                key: offtoData.Activity[activity],
                label: offtoData.Activity[activity],
              };
            })}
          />
          <p className={css.bioInfo}>
            <FormattedMessage id="ProfileSettingsShopForm.bioInfo" />
          </p>
        </div>
      );

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageCreateListingDraft}
          {errorMessageUpdateListing}
          {errorMessageShowListing}

          {formDivs.activity}

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingRentalstyleFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingRentalstyleFormComponent.propTypes = {
  className: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  categories: arrayOf(
    shape({
      key: string.isRequired,
      label: string.isRequired,
    })
  ),
};

export default compose(injectIntl)(EditListingRentalstyleFormComponent);
