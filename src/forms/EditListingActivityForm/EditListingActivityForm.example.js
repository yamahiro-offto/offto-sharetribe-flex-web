/* eslint-disable no-console */
import EditListingActivityForm from './EditListingActivityForm';

export const Empty = {
  component: EditListingActivityForm,
  props: {
    onSubmit: values => {
      console.log('Submit EditListingActivityForm with (unformatted) values:', values);
    },
    saveActionMsg: 'Save description',
    updated: false,
    updateInProgress: false,
    disabled: false,
    ready: false,
  },
  group: 'forms',
};
