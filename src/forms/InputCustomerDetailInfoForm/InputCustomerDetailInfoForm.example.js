/* eslint-disable no-console */
import InputCustomerDetailInfoForm from './InputCustomerDetailInfoForm';

export const Empty = {
  component: InputCustomerDetailInfoForm,
  props: {
    onSubmit: values => {
      console.log('Submit InputCustomerDetailInfoForm with (unformatted) values:', values);
    },
    saveActionMsg: 'Save description',
    updated: false,
    updateInProgress: false,
    disabled: false,
    ready: false,
  },
  group: 'forms',
};
