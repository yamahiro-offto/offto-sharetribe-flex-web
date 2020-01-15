import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { parse } from '../../util/urlHelpers';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  Page,
  UserNav,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import { ManageAdditionalItemsForm } from '../../forms';
import { TopbarContainer } from '..';

import { updateProfile } from './ManageAdditionalItemsPage.duck';
import css from './ManageAdditionalItemsPage.css';

export class ManageAdditionalItemsPageComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { currentUser, scrollingDisabled, onUpdateProfile, intl } = this.props;

    const handleSubmit = values => {};
    const onUpdate = values => {
      const additionalItems = values;
      const updatedValues = { publicData: { additionalItems } };

      onUpdateProfile(updatedValues);
    };

    const additionalItems =
      (currentUser && currentUser.attributes.profile.publicData.additionalItems) || [];

    const heading =
      additionalItems.length > 0 ? (
        <h1 className={css.title}>
          <FormattedMessage
            id="ManageAdditionalItemsPage.youHaveAdditionalItems"
            values={{ count: additionalItems.length }}
          />
        </h1>
      ) : additionalItems.length === 0 ? (
        <h1 className={css.title}>
          <FormattedMessage id="ManageAdditionalItemsPage.noAdditionalItems" />
        </h1>
      ) : null;

    const title = intl.formatMessage({ id: 'ManageAdditionalItemsPage.title' });

    const panelWidth = 62.5;
    // Render hints for responsive image
    const renderSizes = [
      `(max-width: 767px) 100vw`,
      `(max-width: 1920px) ${panelWidth / 2}vw`,
      `${panelWidth / 3}vw`,
    ].join(', ');

    return (
      <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="ManageAdditionalItemsPage" />
            <UserNav selectedPageName="ManageAdditionalItemsPage" currentUser={currentUser} />
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            <div className={css.listingPanel}>{heading}</div>
            <div className={css.content}>
              <ManageAdditionalItemsForm
                additionalItems={additionalItems}
                onSubmit={handleSubmit}
                onUpdate={onUpdate}
              />
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

ManageAdditionalItemsPageComponent.defaultProps = {
  currentUser: null,
};

const { bool } = PropTypes;
ManageAdditionalItemsPageComponent.propTypes = {
  currentUser: propTypes.currentUser.isRequired,
  scrollingDisabled: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;

  return {
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const mapDispatchToProps = dispatch => ({
  // onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
});
const ManageAdditionalItemsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ManageAdditionalItemsPageComponent);

export default ManageAdditionalItemsPage;
