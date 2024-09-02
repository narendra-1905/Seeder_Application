import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Seeder Application text', () => {
  render(<App />);
  const linkElement = screen.getByText(/Seeder Application/i);
  expect(linkElement).toBeInTheDocument();
});
