import React from 'react';
import CashAccelerationPage from '.';
import { Meta, StoryFn } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../App';

export default {
  title: 'Pages/CashAccelerationPage',
  component: CashAccelerationPage,
  decorators: [
    (StoryFn) => (
      <MemoryRouter>
        <UserContext.Provider value={{ id: '1', setId: () => {} }}>
          <StoryFn />
        </UserContext.Provider>
      </MemoryRouter>
    ),
  ],
} as Meta;

const Template: StoryFn = (args) => <CashAccelerationPage {...args} />;

export const Default = Template.bind({});
Default.args = {};
