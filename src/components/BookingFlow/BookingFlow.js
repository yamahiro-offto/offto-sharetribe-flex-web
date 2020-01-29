import React from 'react';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import { arrayOf, bool, func, node, oneOfType, shape, string } from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { propTypes, LISTING_STATE_CLOSED, LINE_ITEM_NIGHT, LINE_ITEM_DAY } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { parse, stringify } from '../../util/urlHelpers';
import config from '../../config';
import { ModalInMobile, Button } from '..';
import { BookingDatesForm } from '../../forms';

import css from './BookingFlow.css';

// This defines when ModalInMobile shows content as Modal
const MODAL_BREAKPOINT = 1023;

const BookingFlow = props => {
  const {
    rootClassName,
  } = props;
  return (
    <ul className={css.bookingFlowWrapper}>
      <li className={css.bookingFlowAccessories}>
        <FormattedMessage id="BookingFlow.accessories" />
      </li>
      <li className={css.bookingFlowCustomerinfo} >
        <FormattedMessage id="BookingFlow.customerinfo" />
      </li>
      <li className={css.bookingFlowPayment} >
        <FormattedMessage id="BookingFlow.payment" />
      </li>
    </ul>
  );
};

export default compose(
  withRouter,
  injectIntl
)(BookingFlow);
