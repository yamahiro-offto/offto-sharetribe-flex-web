/* eslint-disable no-console */
import EditListingRentalstyleForm from './EditListingRentalstyleForm';

export const Empty = {
  component: EditListingRentalstyleForm,
  props: {
    onSubmit: values => {
      console.log('Submit EditListingRentalstyleForm with (unformatted) values:', values);
    },
    saveActionMsg: 'Save description',
    updated: false,
    updateInProgress: false,
    disabled: false,
    ready: false,
  },
  group: 'forms',
};
