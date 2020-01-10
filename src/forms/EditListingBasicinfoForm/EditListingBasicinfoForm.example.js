/* eslint-disable no-console */
import EditListingBasicinfoForm from './EditListingBasicinfoForm';

export const Empty = {
  component: EditListingBasicinfoForm,
  props: {
    onSubmit: values => {
      console.log('Submit EditListingBasicinfoForm with (unformatted) values:', values);
    },
    saveActionMsg: 'Save description',
    updated: false,
    updateInProgress: false,
    disabled: false,
    ready: false,
  },
  group: 'forms',
};
