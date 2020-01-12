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

      // title
      formDivs.push(
        <FieldTextInput
          id="title"
          name="title"
          className={css.title}
          type="text"
          label={'Gear Name'}
          placeholder={'title of your gear'}
          validate={composeValidators(required('title is required'))}
        />
      );

      // gearId
      formDivs.push(
        <FieldTextInput
          id="gearId"
          name="gearId"
          className={css.title}
          type="text"
          label={'Gear Id'}
          placeholder={'Id of this gear in your shop'}
          validate={composeValidators(required('title is required'))}
        />
      );

      // activityType
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            id="activityType"
            name="activityType" // values の key
            label={'activityType'}
            placeholder={'placeholder'}
            validate=""
            // options={[{ key: 'customer', label: 'customer' }, { key: 'shop', label: 'shop' }]}
            options={Object.keys(activityType).map(activityTypeEnum => {
              return {
                key: activityType[activityTypeEnum],
                label: activityType[activityTypeEnum],
              };
            })}
          />
        </div>
      );

      // size
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            classname={css.selectCustom}
            id="size"
            name="size" // values の key
            label={'size'}
            placeholder={'placeholder'}
            validate=""
            // options={[{ key: 'customer', label: 'customer' }, { key: 'shop', label: 'shop' }]}
            options={Object.keys(offtoData.Size).map(size => {
              return {
                key: offtoData.Size[size],
                label: offtoData.Size[size],
              };
            })}
          />
        </div>
      );

      // skill
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            classname={css.selectCustom}
            id="skill"
            name="skill" // values の key
            label={'skill'}
            placeholder={'placeholder'}
            validate=""
            // options={[{ key: 'customer', label: 'customer' }, { key: 'shop', label: 'shop' }]}
            options={Object.keys(offtoData.Skill).map(skill => {
              return {
                key: offtoData.Skill[skill],
                label: offtoData.Skill[skill],
              };
            })}
          />
        </div>
      );

      // age
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            classname={css.selectCustom}
            id="age"
            name="age" // values の key
            label={'age'}
            placeholder={'placeholder'}
            validate=""
            // options={[{ key: 'customer', label: 'customer' }, { key: 'shop', label: 'shop' }]}
            options={Object.keys(offtoData.Age).map(age => {
              return {
                key: offtoData.Age[age],
                label: offtoData.Age[age],
              };
            })}
          />
        </div>
      );

      // gender
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            classname={css.selectCustom}
            id="gender"
            name="gender" // values の key
            label={'gender'}
            placeholder={'placeholder'}
            validate=""
            // options={[{ key: 'customer', label: 'customer' }, { key: 'shop', label: 'shop' }]}
            options={Object.keys(offtoData.Gender).map(gender => {
              return {
                key: offtoData.Gender[gender],
                label: offtoData.Gender[gender],
              };
            })}
          />
        </div>
      );

      // color
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            classname={css.selectCustom}
            id="color"
            name="color" // values の key
            label={'color'}
            placeholder={'placeholder'}
            validate=""
            // options={[{ key: 'customer', label: 'customer' }, { key: 'shop', label: 'shop' }]}
            options={Object.keys(offtoData.Color).map(color => {
              return {
                key: offtoData.Color[color],
                label: offtoData.Color[color],
              };
            })}
          />
        </div>
      );

      // condition
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            classname={css.selectCustom}
            id="condition"
            name="condition" // values の key
            label={'condition'}
            placeholder={'placeholder'}
            validate=""
            // options={[{ key: 'customer', label: 'customer' }, { key: 'shop', label: 'shop' }]}
            options={Object.keys(offtoData.Condition).map(condition => {
              return {
                key: offtoData.Condition[condition],
                label: offtoData.Condition[condition],
              };
            })}
          />
        </div>
      );

      // description
      formDivs.push(
        <div className={css.title}>
          <FieldTextInput
            id="description"
            name="description"
            className={css.title}
            type="textarea"
            label={'description'}
            placeholder={'explain your gear'}
            validate={composeValidators(required('description is required'))}
          />
        </div>
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
