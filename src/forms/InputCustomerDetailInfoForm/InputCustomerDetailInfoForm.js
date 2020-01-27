import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { maxLength, required, composeValidators } from '../../util/validators';
import * as offtoData from '../../util/offtoData';
import { Form, Button, FieldTextInput, FieldSelectCustom } from '../../components';

import css from './InputCustomerDetailInfoForm.css';

const TITLE_MAX_LENGTH = 60;

const InputCustomerDetailInfoFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        categories,
        className,
        currentListing,
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

      const titleMessage = intl.formatMessage({ id: 'InputCustomerDetailInfoForm.title' });
      const titlePlaceholderMessage = intl.formatMessage({
        id: 'InputCustomerDetailInfoForm.titlePlaceholder',
      });
      const titleRequiredMessage = intl.formatMessage({
        id: 'InputCustomerDetailInfoForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'InputCustomerDetailInfoForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      const descriptionMessage = intl.formatMessage({
        id: 'InputCustomerDetailInfoForm.description',
      });
      const descriptionPlaceholderMessage = intl.formatMessage({
        id: 'InputCustomerDetailInfoForm.descriptionPlaceholder',
      });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const descriptionRequiredMessage = intl.formatMessage({
        id: 'InputCustomerDetailInfoForm.descriptionRequired',
      });

      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="InputCustomerDetailInfoForm.updateFailed" />
        </p>
      ) : null;

      // This error happens only on first tab (of EditListingWizard)
      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="InputCustomerDetailInfoForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="InputCustomerDetailInfoForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      // HTMLs to be displayed in this form
      const formDivs = [];

      const activityType =
        offtoData.ACTIVITYTYPE_TABLE[currentListing.attributes.publicData.activity];

      // gender
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            classname={css.selectCustom}
            id="gender"
            name="gender" // values の key
            label={'Gender'}
            placeholder={'placeholder'}
            validate=""
            options={Object.keys(offtoData.Gender).map(gender => {
              return {
                key: offtoData.Gender[gender],
                label: offtoData.Gender[gender],
              };
            })}
          />
        </div>
      );

      // height
      formDivs.push(
        <FieldTextInput
          id="height"
          name="height"
          className={css.title}
          type="text"
          label={'Height'}
          placeholder={'Height in cm'}
          validate={composeValidators(required('Height is required'))}
        />
      );

      // weight
      formDivs.push(
        <FieldTextInput
          id="weight"
          name="weight"
          className={css.title}
          type="text"
          label={'Weight'}
          placeholder={'Weight in kg'}
          validate={composeValidators(required('Weight is required'))}
        />
      );

      // footsize
      formDivs.push(
        <FieldTextInput
          id="footSize"
          name="footSize"
          className={css.title}
          type="text"
          label={'Foot Size'}
          placeholder={'Foot size in cm'}
          validate={composeValidators(required('FootSize is required'))}
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

InputCustomerDetailInfoFormComponent.defaultProps = { className: null, fetchErrors: null };

InputCustomerDetailInfoFormComponent.propTypes = {
  className: string,
  currentListing: propTypes.currentListing,
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

export default compose(injectIntl)(InputCustomerDetailInfoFormComponent);
