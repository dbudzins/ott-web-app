import React from 'react';
import { render } from '@testing-library/react';
import type { Subscription } from 'ott-common/types/subscription';

import customer from '../../fixtures/customer.json';
import subscription from '../../fixtures/subscription.json';

import SubscriptionRenewed from './SubscriptionRenewed';

import type { Customer } from '#types/account';

describe('<SubscriptionRenewed>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<SubscriptionRenewed customer={customer as Customer} subscription={subscription as Subscription} onClose={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
