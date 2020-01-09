import React from 'react';
import { required } from '../../util/validators';
import { FieldSelect } from '../../components';

const FieldSelectCustom = props => {
  const { name, id, options, label, placeholder, validate } = props;
  const validate_ = required(validate);

  return options ? (
    <FieldSelect name={name} id={id} label={label} validate={validate_}>
      <option disabled value="">
        {placeholder}
      </option>
      {options.map(option => {
        return (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        );
      })}
    </FieldSelect>
  ) : null;
};

export default FieldSelectCustom;
