import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import axios from 'axios';
import ChangePasswordPage from './';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: [
        { id: '1', name: 'User1', email: 'Pavan@gmail.com', password: 'oldPassword', availableCredit: 100 },
        { id: '2', name: 'User2', email: 'NotPavan@gmail.com', password: 'anotherOldPassword', availableCredit: 200 },
      ],
    });

    mockedAxios.put.mockResolvedValue({
      data: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component correctly with initial state', () => {
    render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('change-password-component')).toBeInTheDocument();
  });

  it('handleChangePassword updates the changePassword state and submits the form', async () => {
    render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    );

    const allPasswords = screen.getAllByPlaceholderText('');
    const passwordInput = allPasswords[0];
    const changePasswordInput = allPasswords[1];

    expect(passwordInput).toBeInTheDocument();
    expect(changePasswordInput).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: 'abcdefg1' } });
    fireEvent.change(changePasswordInput, { target: { value: 'abcdefg1' } });

    expect(passwordInput).toHaveValue('abcdefg1');
    expect(changePasswordInput).toHaveValue('abcdefg1');

    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith('http://localhost:8000/user/1', expect.objectContaining({ password: 'abcdefg1' }));
      expect(screen.getByText('Password reset successful')).toBeInTheDocument();
      expect(screen.getByText('Click on the button below to proceed to login')).toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: 'Login Now' });
    fireEvent.click(loginButton);
  });

  it('should update user password after successful form submission', async () => {
    render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    );

    const allPasswords = screen.getAllByPlaceholderText('');
    const passwordInput = allPasswords[0];
    const changePasswordInput = allPasswords[1];

    fireEvent.change(passwordInput, { target: { value: 'newPassword1' } });
    fireEvent.change(changePasswordInput, { target: { value: 'newPassword1' } });

    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith('http://localhost:8000/user/1', expect.objectContaining({ password: 'newPassword1' }));
      expect(screen.getByText('Password reset successful')).toBeInTheDocument();
      expect(screen.getByText('Click on the button below to proceed to login')).toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: 'Login Now' });
    fireEvent.click(loginButton);
  });

  it('should handle user email not matching the hardcoded email', async () => {
    render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    );

    const allPasswords = screen.getAllByPlaceholderText('');
    const passwordInput = allPasswords[0];
    const changePasswordInput = allPasswords[1];

    fireEvent.change(passwordInput, { target: { value: 'abcdefg1' } });
    fireEvent.change(changePasswordInput, { target: { value: 'abcdefg1' } });

    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith('http://localhost:8000/user/1', expect.objectContaining({ password: 'abcdefg1' }));
      expect(screen.getByText('Password reset successful')).toBeInTheDocument();
      expect(screen.getByText('Click on the button below to proceed to login')).toBeInTheDocument();
    });

    const initialUserData = [
      { id: '1', name: 'User1', email: 'Pavan@gmail.com', password: 'oldPassword', availableCredit: 100 },
      { id: '2', name: 'User2', email: 'NotPavan@gmail.com', password: 'anotherOldPassword', availableCredit: 200 },
    ];

    expect(initialUserData).toEqual(expect.arrayContaining([
      expect.objectContaining({ email: 'NotPavan@gmail.com', password: 'anotherOldPassword' })
    ]));
  });

  it('should show an error if password does not meet criteria', async () => {
    render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    );
    const allPasswords = screen.getAllByPlaceholderText('');
    const passwordInput = allPasswords[0];
    const changePasswordInput = allPasswords[1];

    fireEvent.change(passwordInput, { target: { value: 'short1' } });
    fireEvent.change(changePasswordInput, { target: { value: 'short1' } });

    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    fireEvent.click(changePasswordButton);

  const errorMessages = screen.getAllByText('Passwords are not in correct format');
  expect(errorMessages).toHaveLength(1);
  });

  it('should show an error if passwords do not match', async () => {
    render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    );


    const allPasswords = screen.getAllByPlaceholderText('');
    const passwordInput = allPasswords[0];
    const changePasswordInput = allPasswords[1];

    fireEvent.change(passwordInput, { target: { value: 'validPassword1' } });
    fireEvent.change(changePasswordInput, { target: { value: 'differentPassword1' } });

    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });
});