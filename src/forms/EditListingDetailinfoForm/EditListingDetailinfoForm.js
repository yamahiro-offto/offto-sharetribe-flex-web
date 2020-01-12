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

import css from './EditListingDetailinfoForm.css';

const TITLE_MAX_LENGTH = 60;

const EditListingDetailinfoFormComponent = props => (
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

      const titleMessage = intl.formatMessage({ id: 'EditListingDetailinfoForm.title' });
      const titlePlaceholderMessage = intl.formatMessage({
        id: 'EditListingDetailinfoForm.titlePlaceholder',
      });
      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailinfoForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailinfoForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      const descriptionMessage = intl.formatMessage({
        id: 'EditListingDetailinfoForm.description',
      });
      const descriptionPlaceholderMessage = intl.formatMessage({
        id: 'EditListingDetailinfoForm.descriptionPlaceholder',
      });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const descriptionRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailinfoForm.descriptionRequired',
      });

      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDetailinfoForm.updateFailed" />
        </p>
      ) : null;

      // This error happens only on first tab (of EditListingWizard)
      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDetailinfoForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDetailinfoForm.showListingFailed" />
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

      // brand
      formDivs.push(
        <FieldTextInput
          id="brand"
          name="brand"
          className={css.title}
          type="text"
          label={'brand'}
          placeholder={'brand of your gear'}
          validate={composeValidators(required('title is required'))}
        />
      );

      // length
      formDivs.push(
        <FieldTextInput
          id="length"
          name="length"
          className={css.title}
          type="text"
          label={'length'}
          placeholder={'Id of this gear in your shop'}
          validate={composeValidators(required('title is required'))}
        />
      );

      // radius
      formDivs.push(
        <FieldTextInput
          id="radius"
          name="radius"
          className={css.title}
          type="text"
          label={'radius'}
          placeholder={'Id of this gear in your shop'}
          validate={composeValidators(required('title is required'))}
        />
      );

      // widthHead
      formDivs.push(
        <FieldTextInput
          id="widthHead"
          name="widthHead"
          className={css.title}
          type="text"
          label={'widthHead'}
          placeholder={'Id of this gear in your shop'}
          validate={composeValidators(required('title is required'))}
        />
      );

      // widthWaist
      formDivs.push(
        <FieldTextInput
          id="widthWaist"
          name="widthWaist"
          className={css.title}
          type="text"
          label={'widthWaist'}
          placeholder={'Id of this gear in your shop'}
          validate={composeValidators(required('title is required'))}
        />
      );

      // widthTail
      formDivs.push(
        <FieldTextInput
          id="widthTail"
          name="widthTail"
          className={css.title}
          type="text"
          label={'widthTail'}
          placeholder={'Id of this gear in your shop'}
          validate={composeValidators(required('title is required'))}
        />
      );

      // binding
      formDivs.push(
        <FieldTextInput
          id="binding"
          name="binding"
          className={css.title}
          type="text"
          label={'binding'}
          placeholder={'name of binding'}
          validate={composeValidators(required('title is required'))}
        />
      );

      // modelYear
      formDivs.push(
        <FieldTextInput
          id="modelYear"
          name="modelYear"
          className={css.title}
          type="text"
          label={'Model Year'}
          placeholder={'title of your gear'}
          validate={composeValidators(required('title is required'))}
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

EditListingDetailinfoFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingDetailinfoFormComponent.propTypes = {
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

export default compose(injectIntl)(EditListingDetailinfoFormComponent);
