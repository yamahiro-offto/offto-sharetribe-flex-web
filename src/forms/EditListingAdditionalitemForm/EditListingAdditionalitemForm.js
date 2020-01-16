import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { maxLength, required, composeValidators } from '../../util/validators';
import * as offtoData from '../../util/offtoData';
import {
  Form,
  Button,
  FieldCheckboxGroup,
  FieldTextInput,
  FieldSelectCustom,
} from '../../components';

import css from './EditListingAdditionalitemForm.css';
import { currentUserShowSuccess } from '../../ducks/user.duck';

const TITLE_MAX_LENGTH = 60;

const EditListingAdditionalitemFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        categories,
        className,
        currentListing,
        currentUser,
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

      const titleMessage = intl.formatMessage({ id: 'EditListingAdditionalitemForm.title' });
      const titlePlaceholderMessage = intl.formatMessage({
        id: 'EditListingAdditionalitemForm.titlePlaceholder',
      });
      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingAdditionalitemForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingAdditionalitemForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      const descriptionMessage = intl.formatMessage({
        id: 'EditListingAdditionalitemForm.description',
      });
      const descriptionPlaceholderMessage = intl.formatMessage({
        id: 'EditListingAdditionalitemForm.descriptionPlaceholder',
      });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const descriptionRequiredMessage = intl.formatMessage({
        id: 'EditListingAdditionalitemForm.descriptionRequired',
      });

      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAdditionalitemForm.updateFailed" />
        </p>
      ) : null;

      // This error happens only on first tab (of EditListingWizard)
      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAdditionalitemForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAdditionalitemForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      // HTMLs to be displayed in this form
      const formDivs = [];

      // additional items
      const additionalItems =
        currentUser &&
        currentUser.attributes.profile.publicData &&
        currentUser.attributes.profile.publicData.additionalItems;
      console.log(currentUser);
      formDivs.push(
        <FieldCheckboxGroup
          className={css.additionalItems}
          id={'additionalItems'}
          name={'additionalItems'}
          options={
            additionalItems
              ? additionalItems.map((item, index) => {
                  return {
                    key: item.id,
                    label:
                      item.price.currency === 'JPY'
                        ? `${item.label}　　${item.price.amount}円`
                        : `${item.label}　　${item.price.amount} ${item.price.amount} [${item.price.currency}]`,
                  };
                })
              : []
          }
        />
      );

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageCreateListingDraft}
          {errorMessageUpdateListing}
          {errorMessageShowListing}

          {formDivs}

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

EditListingAdditionalitemFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingAdditionalitemFormComponent.propTypes = {
  className: string,
  currentListing: propTypes.currentListing,
  currentUser: propTypes.currentUser,
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

export default compose(injectIntl)(EditListingAdditionalitemFormComponent);
