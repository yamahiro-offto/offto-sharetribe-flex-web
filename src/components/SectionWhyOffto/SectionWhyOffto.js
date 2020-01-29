import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';

import { NamedLink } from '..';

import css from './SectionWhyOffto.css';

const SectionWhyOffto = props => {
  const { rootClassName, className } = props;

  const classes = classNames(rootClassName || css.root, className);
  return (
    <div className={classes}>
      <div className={css.title}>
        <FormattedMessage id="SectionWhyOffto.titleLineOne" />
      </div>

      <div className={css.steps}>
        <div className={css.step}>
          <h2 className={css.stepTitle}>
            <FormattedMessage id="SectionWhyOffto.part1Title" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyOffto.part1Text" />
          </p>
        </div>

        <div className={css.step}>
          <h2 className={css.stepTitle}>
            <FormattedMessage id="SectionWhyOffto.part2Title" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyOffto.part2Text" />
          </p>
        </div>

        <div className={css.step}>
          <h2 className={css.stepTitle}>
            <FormattedMessage id="SectionWhyOffto.part3Title" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyOffto.part3Text" />
          </p>
        </div>
      </div>
    </div>
  );
};

SectionWhyOffto.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

SectionWhyOffto.propTypes = {
  rootClassName: string,
  className: string,
};

export default SectionWhyOffto;
