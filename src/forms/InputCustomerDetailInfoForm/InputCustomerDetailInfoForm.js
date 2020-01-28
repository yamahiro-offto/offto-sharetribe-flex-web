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
import { overrideArrays } from '../../util/data';

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
            validate={composeValidators(required('Please select your gender'))}
            options={Object.keys(offtoData.Gender).map(gender => {
              return {
                key: offtoData.Gender[gender],
                label: offtoData.Gender[gender],
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
            label={'Age'}
            placeholder={'placeholder'}
            validate={composeValidators(required('Please select your age'))}
            options={[...Array(200).keys()].map(age => {
              return {
                key: age,
                label: age,
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
            label={'Skill'}
            placeholder={'placeholder'}
            validate={composeValidators(required('Please select your skill'))}
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

      // TODO: limit time accoring to the business hour of the shop (of listing)
      // key and label of time (00:00 - 23:50)
      const timeKeyLabels = [...Array(24).keys()].map(hour =>
        [...Array(60 / 10).keys()].map(minute => {
          return {
            key: `${('00' + String(hour)).slice(-2)}:${('00' + String(minute * 10)).slice(-2)}`,
            label: `${('00' + String(hour)).slice(-2)}:${('00' + String(minute * 10)).slice(-2)}`,
          };
        })
      );

      // pickup Time
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            classname={css.selectCustom}
            id="pickUpTime"
            name="pickUpTime" // values の key
            label={'Pick up time'}
            placeholder={'placeholder'}
            validate={composeValidators(required('Please select pick up time'))}
            options={timeKeyLabels.flat()}
          />
        </div>
      );

      // dropoff Time
      formDivs.push(
        <div className={css.selectCustom}>
          <FieldSelectCustom
            classname={css.selectCustom}
            id="dropOffTime"
            name="dropOffTime" // values の key
            label={'Drop off time'}
            placeholder={'placeholder'}
            validate={composeValidators(required('Please select drop off time'))}
            options={timeKeyLabels.flat()}
          />
        </div>
      );

      // message
      formDivs.push(
        <FieldTextInput
          id="message"
          name="message"
          className={css.title}
          type="text"
          label={'Message (optional)'}
          placeholder={"Hi! I'm Hiroki."}
          // validate={composeValidators(required('FootSize is required'))}
        />
      );

      return (
        <Form className={classes} onSubmit={handleSubmit}>
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
