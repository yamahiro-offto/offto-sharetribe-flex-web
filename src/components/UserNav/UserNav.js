import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { ACCOUNT_SETTINGS_PAGES } from '../../routeConfiguration';
import { LinkTabNavHorizontal } from '../../components';
import { OfftoUser } from '../../util/offtoData';

import css from './UserNav.css';
import { propTypes } from '../../util/types';

const UserNav = props => {
  const { className, rootClassName, selectedPageName, currentUser } = props;
  const classes = classNames(rootClassName || css.root, className);

  const tabs = [
    {
      text: <FormattedMessage id="ManageListingsPage.yourListings" />,
      selected: selectedPageName === 'ManageListingsPage',
      linkProps: {
        name: 'ManageListingsPage',
      },
    },
    {
      text: <FormattedMessage id="ManageListingsPage.profileSettings" />,
      selected: selectedPageName === 'ProfileSettingsPage',
      disabled: false,
      linkProps: {
        name: 'ProfileSettingsPage',
      },
    },
    {
      text: <FormattedMessage id="ManageListingsPage.accountSettings" />,
      selected: ACCOUNT_SETTINGS_PAGES.includes(selectedPageName),
      disabled: false,
      linkProps: {
        name: 'ContactDetailsPage',
      },
    },
  ];

  if (OfftoUser.userIsShop(currentUser)) {
    tabs[1] = {
      text: <FormattedMessage id="ManageListingsPage.profileSettings" />,
      selected: selectedPageName === 'ProfileSettingsShopPage',
      disabled: false,
      linkProps: {
        name: 'ProfileSettingsShopPage',
      },
    };
  } else {
    tabs.splice(0, 1);
  }

  return (
    <LinkTabNavHorizontal className={classes} tabRootClassName={css.tab} tabs={tabs} skin="dark" />
  );
};

UserNav.defaultProps = {
  className: null,
  rootClassName: null,
  currentUser: null,
};

const { string } = PropTypes;

UserNav.propTypes = {
  className: string,
  rootClassName: string,
  selectedPageName: string.isRequired,
  currentUser: propTypes.currentUser.isRequired,
};

export default UserNav;
