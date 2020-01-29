import React from 'react';
import { arrayOf, bool, func, shape, string, array } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
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
        className,
        additionalItems,
        disabled,
        ready,
        handleSubmit,
        onChange,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
      } = formRenderProps;


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

      const additionalItemOptions = additionalItems
        ? additionalItems.map((item, index) => {
            return {
              key: item.id,
              label:
                item.price.currency === 'JPY'
                  ? `${item.label}　　 ${item.price.amount} 円`
                  : `${item.label}　　 ${item.price.amount} [${item.price.currency}]`,
            };
          })
        : [];

      // HTMLs to be displayed in this form
      const formDivs = [];

      // additional items
      formDivs.push(
        <FieldCheckboxGroup
          className={css.additionalItems}
          id={'additionalItemIds'}
          name={'additionalItemIds'}
          options={additionalItemOptions}
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
          <OnChange>
            {(value, previous) => {
              onChange && onChange(value, previous);
            }}
          </OnChange>
        </Form>
      );
    }}
  />
);

EditListingAdditionalitemFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingAdditionalitemFormComponent.propTypes = {
  className: string,
  additionalItems: array.isRequired,
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
