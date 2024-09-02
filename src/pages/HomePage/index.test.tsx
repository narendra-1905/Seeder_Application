import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import axios from 'axios';
import HomePage, { initialState, reducer } from '.';
import { addMonths } from '../../utils/helper';
import theme from '../../theme';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HomePage Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: [
        {
          id: '1',
          userId: 1,
          name: 'Cash Kick 1',
          status: 'Active',
          maturity: addMonths(
            new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            }),
            4
          ),
          totalRecievedMonths: 12,
          totalRecievedPercentage: 50,
          totalFinanced: 170454.55,
          totalReceived: 60000,
        },
      ],
    });
  });

  it('fetches and displays cash kicks data', async () => {
    render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <HomePage
            userId={1}
            onFailureFunc={() => {}}
            onConnectFunc={() => {}}
          />
        </BrowserRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByText(/Congratulations you are ready to start!/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/Launch a new Cash Kick/i)).toBeInTheDocument();
  });

  it('displays the correct payment details after fetching data', async () => {
    render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <HomePage
            userId={-1}
            onFailureFunc={() => {}}
            onConnectFunc={() => {}}
          />
        </BrowserRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Due in 30 day(s)')).toBeInTheDocument();
    });

    expect(screen.getByText('Outstanding amount')).toBeInTheDocument();
  });

  it('handles reducer default case', () => {
    const action = {
      type: 'UNKNOWN_ACTION',
      payload: {
        paymentsData: [
          {
            id: '1',
            dueDate: ['Oct 19,2024', '31 days'],
            status: 'active',
            expectedAmount: '17000',
            outStanding: '12000',
          },
        ],
        totalOutstanding: 0,
        dueAmount: 0,
      },
    };
    const nextState = reducer(initialState, action);

    expect(nextState).toEqual(initialState);
  });

  it('handles fetch error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Failed to fetch Cash kicks'));

    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <HomePage
            userId={-1}
            onFailureFunc={() => {}}
            onConnectFunc={() => {}}
          />
        </BrowserRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });

    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch Cash kicks:',
      expect.any(Error)
    );

    consoleErrorMock.mockRestore(); // Restore console.error
  });

  it('handles maturity date error', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <HomePage
            userId={1}
            onFailureFunc={() => {}}
            onConnectFunc={() => {}}
          />
        </BrowserRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(4);
    });

    expect(console.error).toHaveBeenCalledWith(
      'Maturity date is not defined in the data',
      expect.any(Error)
    );

    consoleErrorMock.mockRestore(); // Restore console.error
  });

  it('navigates to CashAccleration page on click', async () => {
    render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <HomePage
            userId={1}
            onFailureFunc={() => {}}
            onConnectFunc={() => {}}
          />
        </BrowserRouter>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Cash Acceleration'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/cash-acceleration');
    });

    fireEvent.click(screen.getByText('New Cash Kick'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/new-cash-kick');
    });

    fireEvent.click(screen.getByAltText('Avatar Icon'));
    await waitFor(async () => {
      expect(screen.getByText('Log Out')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Log Out'));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });
});
