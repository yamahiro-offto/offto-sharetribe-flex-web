/* eslint-disable no-console */
import EditListingDetailinfoForm from './EditListingDetailinfoForm';

export const Empty = {
  component: EditListingDetailinfoForm,
  props: {
    onSubmit: values => {
      console.log('Submit EditListingDetailinfoForm with (unformatted) values:', values);
    },
    saveActionMsg: 'Save description',
    updated: false,
    updateInProgress: false,
    disabled: false,
    ready: false,
  },
  group: 'forms',
};
