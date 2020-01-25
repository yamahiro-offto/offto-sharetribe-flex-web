import { types as sdkTypes } from '../../util/sdkLoader';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import * as offtoData from '../../util/offtoData';
import {
  Page,
  UserNav,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  NamedLink,
} from '../../components';
import { ProfileSettingsShopForm } from '../../forms';
import { TopbarContainer } from '../../containers';

import { updateProfile, uploadImage } from './ProfileSettingsShopPage.duck';
import css from './ProfileSettingsShopPage.css';

const { LatLng, UUID, Money } = sdkTypes;

const onImageUploadHandler = (values, fn) => {
  const { id, imageId, file } = values;
  if (file) {
    fn({ id, imageId, file });
  }
};

export class ProfileSettingsShopPageComponent extends Component {
  render() {
    const {
      currentUser,
      image,
      onImageUpload,
      onUpdateProfile,
      scrollingDisabled,
      updateInProgress,
      updateProfileError,
      uploadImageError,
      uploadInProgress,
      intl,
    } = this.props;

    const handleSubmit = values => {
      const {
        firstName,
        lastName,
        displayName,
        geolocation,
        building,
        profileImage,
        publicData,
      } = values;

      const publicData_ = offtoData.OfftoUser.sanitizePublicData({
        ...publicData,
        geolocation,
        building,
      });

      const updateProfile = { firstName, lastName, displayName, publicData: publicData_ };

      // Update profileImage only if file system has been accessed
      const uploadedImage = this.props.image;
      const { abbreviatedName, ...updatedValues } =
        uploadedImage && uploadedImage.imageId && uploadedImage.file
          ? { ...updateProfile, profileImageId: uploadedImage.imageId }
          : updateProfile;

      onUpdateProfile(updatedValues);
    };

    const user = ensureCurrentUser(currentUser);
    const { firstName, lastName, displayName, bio } = user.attributes.profile;
    const geolocation =
      (user.attributes.profile.publicData && user.attributes.profile.publicData.geolocation) || {};
    const building =
      (user.attributes.profile.publicData && user.attributes.profile.publicData.building) || '';
    const profileImageId = user.profileImage ? user.profileImage.id : null;
    const profileImage = image || { imageId: profileImageId };
    const publicData = (user.attributes.profile && user.attributes.profile.publicData) || {};

    if (geolocation.selectedPlace) {
      geolocation.selectedPlace.bounds.ne = new LatLng(geolocation.selectedPlace.bounds.ne);
      geolocation.selectedPlace.bounds.sw = new LatLng(geolocation.selectedPlace.bounds.sw);
      geolocation.selectedPlace.origin = new LatLng(geolocation.selectedPlace.origin);
    }

    const profileSettingsForm = user.id ? (
      <ProfileSettingsShopForm
        className={css.form}
        currentUser={currentUser}
        initialValues={{
          firstName,
          lastName,
          displayName,
          bio,
          geolocation,
          building,
          profileImage,
          publicData,
        }}
        profileImage={profileImage}
        onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
        uploadInProgress={uploadInProgress}
        updateInProgress={updateInProgress}
        uploadImageError={uploadImageError}
        updateProfileError={updateProfileError}
        onSubmit={handleSubmit}
      />
    ) : null;

    const title = intl.formatMessage({ id: 'ProfileSettingsShopPage.title' });

    return (
      <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="ProfileSettingsShopPage" />
            <UserNav selectedPageName="ProfileSettingsShopPage" currentUser={currentUser} />
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            <div className={css.content}>
              <div className={css.headingContainer}>
                <h1 className={css.heading}>
                  <FormattedMessage id="ProfileSettingsShopPage.heading" />
                </h1>
                {user.id ? (
                  <NamedLink
                    className={css.profileLink}
                    name="ProfileShopPage"
                    params={{ id: user.id.uuid }}
                  >
                    <FormattedMessage id="ProfileSettingsShopPage.viewProfileLink" />
                  </NamedLink>
                ) : null}
              </div>
              {profileSettingsForm}
            </div>
          </LayoutWrapperMain>
          <LayoutWrapperFooter>
            <Footer />
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

ProfileSettingsShopPageComponent.defaultProps = {
  currentUser: null,
  uploadImageError: null,
  updateProfileError: null,
  image: null,
};

const { bool, func, object, shape, string } = PropTypes;

ProfileSettingsShopPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  image: shape({
    id: string,
    imageId: propTypes.uuid,
    file: object,
    uploadedImage: propTypes.image,
  }),
  onImageUpload: func.isRequired,
  onUpdateProfile: func.isRequired,
  scrollingDisabled: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    image,
    uploadImageError,
    uploadInProgress,
    updateInProgress,
    updateProfileError,
  } = state.ProfileSettingsShopPage;
  return {
    currentUser,
    image,
    scrollingDisabled: isScrollingDisabled(state),
    updateInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
  };
};

const mapDispatchToProps = dispatch => ({
  onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
});

const ProfileSettingsShopPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ProfileSettingsShopPageComponent);

export default ProfileSettingsShopPage;
