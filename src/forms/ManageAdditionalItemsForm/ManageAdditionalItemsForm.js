import React, { Component } from 'react';
import { bool, string, func, array } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Field, Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { ensureCurrentUser } from '../../util/data';
import { propTypes } from '../../util/types';
import * as validators from '../../util/validators';
import { isUploadImageOverLimitError } from '../../util/errors';
import { Form, Avatar, Button, ImageFromFile, IconSpinner, FieldTextInput } from '../../components';

import css from './ManageAdditionalItemsForm.css';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset

class ManageAdditionalItemsFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.submittedValues = {};

    this.state = {
      uploadDelay: false,
      inputtingFields: {
        label: '',
        price: '',
      },
    };

    this.additionalItems = [];
  }

  componentDidUpdate(prevProps) {
    // Upload delay is additional time window where Avatar is added to the DOM,
    // but not yet visible (time to load image URL from srcset)
    if (prevProps.uploadInProgress && !this.props.uploadInProgress) {
      this.setState({ uploadDelay: true });
      this.uploadDelayTimeoutId = window.setTimeout(() => {
        this.setState({ uploadDelay: false });
      }, UPLOAD_CHANGE_DELAY);
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.uploadDelayTimeoutId);
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        render={fieldRenderProps => {
          const {
            className,
            additionalItems,
            handleSubmit,
            onUpdate,
            intl,
            invalid,
            pristine,
            rootClassName,
            updateInProgress,
            updateProfileError,
            uploadInProgress,
            form,
            values,
          } = fieldRenderProps;

          this.additionalItems = additionalItems;

          const uploadingOverlay =
            uploadInProgress || this.state.uploadDelay ? (
              <div className={css.uploadingImageOverlay}>
                <IconSpinner />
              </div>
            ) : null;

          const submitError = updateProfileError ? (
            <div className={css.error}>
              <FormattedMessage id="ManageAdditionalItemsForm.updateProfileFailed" />
            </div>
          ) : null;

          const classes = classNames(rootClassName || css.root, className);
          const submitInProgress = updateInProgress;
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid || pristine || pristineSinceLastSubmit || uploadInProgress || submitInProgress;

          const onEditButtonClickCallback = index => e => {
            console.log(additionalItems[index]);
          };

          const editButton = index => (
            <button
              className={css.editItemButton}
              // type="submit"
              inProgress={submitInProgress}
              ready={pristineSinceLastSubmit}
              onClick={onEditButtonClickCallback(index)}
            >
              <FormattedMessage id="ManageAdditionalItemsForm.editItem" />
            </button>
          );

          const onDeleteButtonClickCallback = index => e => {
            this.additionalItems.splice(index, index + 1);

            onUpdate(this.additionalItems);
          };

          const deleteButton = index => (
            <button
              className={css.deleteItemButton}
              // type="submit"
              inProgress={submitInProgress}
              ready={pristineSinceLastSubmit}
              onClick={onDeleteButtonClickCallback(index)}
            >
              <FormattedMessage id="ManageAdditionalItemsForm.deleteItem" />
            </button>
          );

          const onAddItemButtonClickCallback = e => {
            const { price, label } = this.state.inputtingFields;

            const labelIsEmptyString = label === '';
            if (labelIsEmptyString) {
              alert(
                intl.formatMessage({ id: 'ManageAdditionalItemsForm.alartAddingItemLabelEmpty' })
              );
              return;
            }

            const priceIsEmptyString = price === '';
            const priceIsNotNubmer = !Number(price) && Number(price) !== 0;
            const priceIsMinus = Number(price) < 0;
            if (priceIsEmptyString || priceIsNotNubmer || priceIsMinus) {
              alert(
                intl.formatMessage({ id: 'ManageAdditionalItemsForm.alartAddingItemPriceInvalid' })
              );
              return;
            }

            const id = new Date().getTime();
            this.additionalItems.push({
              id,
              label,
              price: {
                amount: Number(price),
                currency: 'JPY',
              },
            });

            onUpdate(this.additionalItems);
          };

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              {submitError}
              {additionalItems.map((item, index) => {
                const currency =
                  item.price && item.price.currency === 'JPY' ? '円' : `[${item.price.currency}]`;

                return (
                  <div class={css.additionalItemDiv}>
                    <div class={css.additionalItemInfo}>{item.label}</div>
                    <div class={css.additionalItemInfoMargin}></div>
                    <div class={css.additionalItemInfo}>{item.price.amount + currency}</div>
                    {/* {editButton(index)} */}
                    {deleteButton(index)}
                  </div>
                );
              })}
              {
                <div class={css.addItemFieldsDiv}>
                  {/* <FieldTextInput
                    className={css.firstName}
                    type="text"
                    id="firstName"
                    name="firstName"
                    label={firstNameLabel}
                    placeholder={firstNamePlaceholder}
                    validate={firstNameRequired}
                  /> */}

                  <input
                    type="text"
                    className={css.addItemLabelField}
                    placeholder="label"
                    onChange={e => {
                      const label = e.target.value;
                      this.setState({
                        inputtingFields: { ...this.state.inputtingFields, label },
                      });
                    }}
                  />
                  <div class={css.additionalItemInfoMargin}></div>
                  <input
                    type="text"
                    className={css.addItemPriceAmountField}
                    placeholder="price"
                    onChange={e => {
                      const price = e.target.value;
                      this.setState({
                        inputtingFields: { ...this.state.inputtingFields, price },
                      });
                    }}
                  />
                  <div>{'円'}</div>
                  <button
                    className={css.addItemButton}
                    inProgress={submitInProgress}
                    ready={pristineSinceLastSubmit}
                    onClick={e => onAddItemButtonClickCallback(e)}
                  >
                    <FormattedMessage id="ManageAdditionalItemsForm.addItem" />
                  </button>
                </div>
              }

              {/* 
              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={pristineSinceLastSubmit}
              >
                <FormattedMessage id="ManageAdditionalItemsForm.saveChanges" />
              </Button> */}
            </Form>
          );
        }}
      />
    );
  }
}

ManageAdditionalItemsFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  uploadImageError: null,
  updateProfileError: null,
  updateProfileReady: false,
};

ManageAdditionalItemsFormComponent.propTypes = {
  rootClassName: string,
  className: string,

  additionalItems: array.isRequired,
  onSubmit: func.isRequired,

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const ManageAdditionalItemsForm = compose(injectIntl)(ManageAdditionalItemsFormComponent);

ManageAdditionalItemsForm.displayName = 'ManageAdditionalItemsForm';

export default ManageAdditionalItemsForm;
