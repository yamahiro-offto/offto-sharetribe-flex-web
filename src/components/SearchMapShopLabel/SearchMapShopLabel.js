import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { ensureListing, ensureUser } from '../../util/data';
import config from '../../config';

import css from './SearchMapShopLabel.css';

const SUPPORTED_CATEGORY_DISPLAYS = {
  Smoke: 'SMOKE',
  Electric: 'ELECTRIC',
  Camping: 'CAMPING',
  surfing: 'SURFING',
};
const OTHER_CATEGORY_DISPLAY = 'OTHERS';

const ensureShop = shop => {
  return {
    author: ensureUser(shop.author),
    listings: shop.listings.map(listing => {
      return ensureListing(listing);
    }),
  };
};

class SearchMapShopLabel extends Component {
  // overwrite Component method
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    const currentShop = ensureShop(currentProps.shop);
    const nextShop = ensureShop(nextProps.shop);
    console.log('currentShop', currentShop);
    console.log('nextShop', nextShop);

    const isSameShop = currentShop.author.id.uuid === nextShop.author.id.uuid;
    const hasSameListings = currentShop.listings === nextShop.listings;
    const hasSameActiveStatus = currentProps.isActive === nextProps.isActive;
    const hasSameRefreshToken =
      currentProps.mapComponentRefreshToken === nextProps.mapComponentRefreshToken;

    return !(isSameShop && hasSameListings && hasSameActiveStatus && hasSameRefreshToken);
  }

  render() {
    const { className, rootClassName, intl, shop, onListingClicked, isActive } = this.props;
    const currentShop = ensureShop(shop);
    const category = shop.author.attributes.profile.publicData.Category;

    // Create formatted price if currency is known or alternatively show just the unknown currency.
    // const formattedPrice =
    //   price && price.currency === config.currency ? formatMoney(intl, price) : price.currency;
    console.log('category', category);
    const formattedCategory =
      (category && SUPPORTED_CATEGORY_DISPLAYS[category]) || OTHER_CATEGORY_DISPLAY;

    const classes = classNames(rootClassName || css.root, className);
    const shopLabelClasses = classNames(css.shopLabel, { [css.shopLabelActive]: isActive });
    const caretClasses = classNames(css.caret, { [css.caretActive]: isActive });

    return (
      <button className={classes} onClick={() => onListingClicked(currentShop)}>
        <div className={css.caretShadow} />
        <div className={shopLabelClasses}>{formattedCategory}</div>
        <div className={caretClasses} />
      </button>
    );
  }
}

SearchMapShopLabel.defaultProps = {
  className: null,
  rootClassName: null,
};

const { func, string, bool, shape, arrayOf } = PropTypes;

SearchMapShopLabel.propTypes = {
  className: string,
  rootClassName: string,
  shop: shape({
    author: propTypes.user.isRequired,
    listings: arrayOf(propTypes.listing.isRequired).isRequired,
  }).isRequired,
  onListingClicked: func.isRequired,
  isActive: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

export default injectIntl(SearchMapShopLabel);
