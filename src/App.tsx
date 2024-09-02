import React, { createContext, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetCodePage from './pages/ResetCodePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import SignUpPage from './pages/SignUpPage';
import CashAccelerationPage from './pages/CashAccelerationPage';
import NewCashkick from './pages/NewCashKick';

interface UserContextType {
  id: string;
  setId: (id: string) => void;
}

export const UserContext = createContext<UserContextType>({
  id: '',
  setId: () => {},
});

const App = () => {
  // return <div>Seeder Application</div>;

  const [id, setId] = useState<string>('');

  return (
    <UserContext.Provider value={{ id: id, setId: setId }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/home"
              element={
                <HomePage
                  onConnectFunc={() => {}}
                  onFailureFunc={() => {}}
                  // userId={Number(userId)}
                />
              }
            />
            <Route path="/new-cash-kick" element={<NewCashkick />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/cash-acceleration"
              element={<CashAccelerationPage />}
            />
            <Route path="/reset-code-page" element={<ResetCodePage />} />
            <Route
              path="/change-password-page"
              element={<ChangePasswordPage />}
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </UserContext.Provider>
  );
};

export default App;
