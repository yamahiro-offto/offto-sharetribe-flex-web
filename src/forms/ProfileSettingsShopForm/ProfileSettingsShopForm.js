import React, { Component } from 'react';
import { bool, string } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Field, Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { ensureCurrentUser } from '../../util/data';
import { propTypes } from '../../util/types';
import * as validators from '../../util/validators';
import { isUploadImageOverLimitError } from '../../util/errors';
import * as offtoData from '../../util/offtoData';
import {
  Form,
  Avatar,
  Button,
  ImageFromFile,
  IconSpinner,
  FieldTextInput,
  FieldSelectCustom,
} from '../../components';

import css from './ProfileSettingsShopForm.css';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset

class ProfileSettingsShopFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = { uploadDelay: false };
    this.submittedValues = {};
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
            currentUser,
            handleSubmit,
            intl,
            invalid,
            onImageUpload,
            pristine,
            profileImage,
            rootClassName,
            updateInProgress,
            updateProfileError,
            uploadImageError,
            uploadInProgress,
            form,
            values,
          } = fieldRenderProps;

          const user = ensureCurrentUser(currentUser);

          // First name
          const firstNameLabel = intl.formatMessage({
            id: 'ProfileSettingsShopForm.firstNameLabel',
          });
          const firstNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsShopForm.firstNamePlaceholder',
          });
          const firstNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsShopForm.firstNameRequired',
          });
          const firstNameRequired = validators.required(firstNameRequiredMessage);

          // Last name
          const lastNameLabel = intl.formatMessage({
            id: 'ProfileSettingsShopForm.lastNameLabel',
          });
          const lastNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsShopForm.lastNamePlaceholder',
          });
          const lastNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsShopForm.lastNameRequired',
          });
          const lastNameRequired = validators.required(lastNameRequiredMessage);

          // Bio
          const bioLabel = intl.formatMessage({
            id: 'ProfileSettingsShopForm.bioLabel',
          });
          const bioPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsShopForm.bioPlaceholder',
          });

          const uploadingOverlay =
            uploadInProgress || this.state.uploadDelay ? (
              <div className={css.uploadingImageOverlay}>
                <IconSpinner />
              </div>
            ) : null;

          const hasUploadError = !!uploadImageError && !uploadInProgress;
          const errorClasses = classNames({ [css.avatarUploadError]: hasUploadError });
          const transientUserProfileImage = profileImage.uploadedImage || user.profileImage;
          const transientUser = { ...user, profileImage: transientUserProfileImage };

          // Ensure that file exists if imageFromFile is used
          const fileExists = !!profileImage.file;
          const fileUploadInProgress = uploadInProgress && fileExists;
          const delayAfterUpload = profileImage.imageId && this.state.uploadDelay;
          const imageFromFile =
            fileExists && (fileUploadInProgress || delayAfterUpload) ? (
              <ImageFromFile
                id={profileImage.id}
                className={errorClasses}
                rootClassName={css.uploadingImage}
                aspectRatioClassName={css.squareAspectRatio}
                file={profileImage.file}
              >
                {uploadingOverlay}
              </ImageFromFile>
            ) : null;

          // Avatar is rendered in hidden during the upload delay
          // Upload delay smoothes image change process:
          // responsive img has time to load srcset stuff before it is shown to user.
          const avatarClasses = classNames(errorClasses, css.avatar, {
            [css.avatarInvisible]: this.state.uploadDelay,
          });
          const avatarComponent =
            !fileUploadInProgress && profileImage.imageId ? (
              <Avatar
                className={avatarClasses}
                renderSizes="(max-width: 767px) 96px, 240px"
                user={transientUser}
                disableProfileLink
              />
            ) : null;

          const chooseAvatarLabel =
            profileImage.imageId || fileUploadInProgress ? (
              <div className={css.avatarContainer}>
                {imageFromFile}
                {avatarComponent}
                <div className={css.changeAvatar}>
                  <FormattedMessage id="ProfileSettingsShopForm.changeAvatar" />
                </div>
              </div>
            ) : (
              <div className={css.avatarPlaceholder}>
                <div className={css.avatarPlaceholderText}>
                  <FormattedMessage id="ProfileSettingsShopForm.addYourProfilePicture" />
                </div>
                <div className={css.avatarPlaceholderTextMobile}>
                  <FormattedMessage id="ProfileSettingsShopForm.addYourProfilePictureMobile" />
                </div>
              </div>
            );

          const submitError = updateProfileError ? (
            <div className={css.error}>
              <FormattedMessage id="ProfileSettingsShopForm.updateProfileFailed" />
            </div>
          ) : null;

          const classes = classNames(rootClassName || css.root, className);
          const submitInProgress = updateInProgress;
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid || pristine || pristineSinceLastSubmit || uploadInProgress || submitInProgress;

          const formJSXs = {};
          formJSXs.profileImage = (
            <div className={css.sectionContainer}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="ProfileSettingsShopForm.yourProfilePicture" />
              </h3>
              <Field
                accept={ACCEPT_IMAGES}
                id="profileImage"
                name="profileImage"
                label={chooseAvatarLabel}
                type="file"
                form={null}
                uploadImageError={uploadImageError}
                disabled={uploadInProgress}
              >
                {fieldProps => {
                  const { accept, id, input, label, disabled, uploadImageError } = fieldProps;
                  const { name, type } = input;
                  const onChange = e => {
                    const file = e.target.files[0];
                    form.change(`profileImage`, file);
                    form.blur(`profileImage`);
                    if (file != null) {
                      const tempId = `${file.name}_${Date.now()}`;
                      onImageUpload({ id: tempId, file });
                    }
                  };

                  let error = null;

                  if (isUploadImageOverLimitError(uploadImageError)) {
                    error = (
                      <div className={css.error}>
                        <FormattedMessage id="ProfileSettingsShopForm.imageUploadFailedFileTooLarge" />
                      </div>
                    );
                  } else if (uploadImageError) {
                    error = (
                      <div className={css.error}>
                        <FormattedMessage id="ProfileSettingsShopForm.imageUploadFailed" />
                      </div>
                    );
                  }

                  return (
                    <div className={css.uploadAvatarWrapper}>
                      <label className={css.label} htmlFor={id}>
                        {label}
                      </label>
                      <input
                        accept={accept}
                        id={id}
                        name={name}
                        className={css.uploadAvatarInput}
                        disabled={disabled}
                        onChange={onChange}
                        type={type}
                      />
                      {error}
                    </div>
                  );
                }}
              </Field>
              <div className={css.tip}>
                <FormattedMessage id="ProfileSettingsShopForm.tip" />
              </div>
              <div className={css.fileInfo}>
                <FormattedMessage id="ProfileSettingsShopForm.fileInfo" />
              </div>
            </div>
          );
          formJSXs.name = (
            <div className={css.sectionContainer}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="ProfileSettingsShopForm.yourName" />
              </h3>
              <div className={css.nameContainer}>
                <FieldTextInput
                  className={css.firstName}
                  type="text"
                  id="firstName"
                  name="firstName"
                  label={firstNameLabel}
                  placeholder={firstNamePlaceholder}
                  validate={firstNameRequired}
                />
                <FieldTextInput
                  className={css.lastName}
                  type="text"
                  id="lastName"
                  name="lastName"
                  label={lastNameLabel}
                  placeholder={lastNamePlaceholder}
                  validate={lastNameRequired}
                />
              </div>
            </div>
          );
          formJSXs.shopName = (
            <div className={css.sectionContainer}>
              <h3 className={css.sectionTitle}>
                {/* <FormattedMessage id="ProfileSettingsShopForm.bioHeading" /> */}
                {'Your shop name'}
              </h3>
              <FieldTextInput
                type="text"
                id="displayName"
                name="displayName"
                label={'shop name'}
                placeholder={'shop name here..'}
              />
            </div>
          );
          formJSXs.intro = (
            <div className={css.sectionContainer}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="ProfileSettingsShopForm.bioHeading" />
              </h3>
              <FieldTextInput
                type="textarea"
                id="bio"
                name="bio"
                label={'your shop introduction'}
                placeholder={'shop name here..'}
              />
            </div>
          );
          formJSXs.userType = (
            <div className={css.sectionContainer}>
              <h3 className={css.sectionTitle}>
                {/* <FormattedMessage id="ProfileSettingsShopForm.bioHeading" /> */}
                {'shop type'}
              </h3>
              <FieldSelectCustom
                id="publicData.type"
                name="publicData.type" // values の key
                label={'publicData type'}
                placeholder={'placeholder'}
                validate=""
                // options={[{ key: 'customer', label: 'customer' }, { key: 'shop', label: 'shop' }]}
                options={Object.keys(offtoData.UserType).map(usertype => {
                  return {
                    key: offtoData.UserType[usertype],
                    label: offtoData.UserType[usertype],
                  };
                })}
              />
              <p className={css.bioInfo}>
                <FormattedMessage id="ProfileSettingsShopForm.bioInfo" />
              </p>
            </div>
          );
          formJSXs.activity = (
            <div className={css.sectionContainer}>
              <h3 className={css.sectionTitle}>
                {/* <FormattedMessage id="ProfileSettingsShopForm.bioHeading" /> */}
                {'Yout Shop activity'}
              </h3>
              <FieldSelectCustom
                id="publicData.activity"
                name="publicData.activity" // values の key
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
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              {formJSXs.profileImage}
              {formJSXs.name}
              {formJSXs.shopName}
              {formJSXs.intro}
              {formJSXs.userType}
              {formJSXs.activity}
              {/* (余白) */}
              <div className={css.lastSection} />
              {submitError}
              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={pristineSinceLastSubmit}
              >
                <FormattedMessage id="ProfileSettingsShopForm.saveChanges" />
              </Button>
            </Form>
          );
        }}
      />
    );
  }
}

ProfileSettingsShopFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  uploadImageError: null,
  updateProfileError: null,
  updateProfileReady: false,
};

ProfileSettingsShopFormComponent.propTypes = {
  rootClassName: string,
  className: string,

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const ProfileSettingsShopForm = compose(injectIntl)(ProfileSettingsShopFormComponent);

ProfileSettingsShopForm.displayName = 'ProfileSettingsShopForm';

export default ProfileSettingsShopForm;
