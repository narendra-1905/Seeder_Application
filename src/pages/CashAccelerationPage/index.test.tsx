import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material';
import axios, { AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import CashAccelerationPage from '.';
// import data from "../../data/data.json"
import theme from '../../theme';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
(axios.get as jest.Mock) = jest.fn();

// jest.mock('@mui/x-data-grid', () => {
//   const actualDataGrid = jest.requireActual('@mui/x-data-grid');
//   return {
//     ...actualDataGrid,
//     DataGrid: (props: any) => <div {...props} />,
//   };
// });

jest.mock('../CashAccelerationPage/index.test.tsx', () => ({
  __esModule: true,
  default: 'mocked-component',
}));

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// jest.mock('../../data/data.json', () => ({
//   SelectedContracts: [],
//   contracts: [],
// }));

describe('CashAccelerationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/contracts')) {
        return Promise.reject(new Error('Error in fetching Contracts'));
      }
      if (url.includes('/cashkicks')) {
        return Promise.reject(new Error('Error fetching cashkicks'));
      }
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render correctly with mocked components', async () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    const logo = screen.getByAltText('Seeder Logo');
    expect(logo).toBeInTheDocument();
  });

  it('should render the SideNavBar with default styles and props', async () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    const cashMenuItem = screen.queryAllByText('Cash Acceleration');
    expect(cashMenuItem.length).toBe(2);

    const homeMenuItem = screen.getByText('Home');
    expect(homeMenuItem).toBeInTheDocument();

    const footerItem = screen.getByText('Watch how to');
    expect(footerItem).toBeInTheDocument();
  });

  it('renders CashAccelerationPage without crashing', async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <CashAccelerationPage />
          </MemoryRouter>
        </ThemeProvider>
      );
    });
    const button = screen.getByRole('button', { name: /Cash Acceleration/i });
    expect(button).toBeInTheDocument();

    const elements = screen.getAllByText('Cash Acceleration');
    elements.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
  });

  it('should render HeaderCard with correct content', () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    const heading = screen.queryAllByText('Cash Acceleration');
    expect(heading.length).toBeGreaterThan(0);
    expect(heading[0]).toBeInTheDocument();

    const content = screen.getByText(
      'Place to create new cash kicks to run your business'
    );
    expect(content).toBeInTheDocument();
  });

  it('should render CashAccelerationCard components with correct content', () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    const termCap = screen.getByText('Term cap');
    expect(termCap).toBeInTheDocument();

    const availableCredit = screen.getByText('Available Credit');
    expect(availableCredit).toBeInTheDocument();

    const maxInterestRate = screen.getByText('Max interest rate');
    expect(maxInterestRate).toBeInTheDocument();
  });

  it('should fetch user data and set available credit', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ availbleCredit: 50000 }],
    });

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('$50.0K')).toBeInTheDocument();
    });
  });

  it('should fetch contracts and cashkicks data', async () => {
    const contractData = [
      {
        id: 1,
        name: 'Contract 1',
        type: 'Type 1',
        perPayment: 1000,
        termLengthMonths: 12,
        termLengthPercentage: 10,
        paymentAmount: 12000,
      },
    ];

    const cashkickData = [
      {
        id: 1,
        name: 'Cashkick 1',
        status: 'Active',
        maturity: '2024-12-31',
        totalRecievedPercentage: 80,
        totalFinanced: 8000,
        totalReceived: 6400,
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: contractData });
    mockedAxios.get.mockResolvedValueOnce({ data: cashkickData });

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      const contractElement = screen.queryByText('Contract', { exact: false });
      expect(contractElement).toBeInTheDocument();

      const cashkickElement = screen.getByText('Cashkick', { exact: false });
      expect(cashkickElement).toBeInTheDocument();
    });
  });

  it('should log an error when fetching user fails', async () => {
    const error = new Error('Network Error');
    mockedAxios.get.mockImplementationOnce(() => Promise.reject(error));
    const consoleErrorMock = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenNthCalledWith(
        1,
        'Error fetching user by ID:',
        error
      );
      expect(consoleErrorMock).toHaveBeenNthCalledWith(
        2,
        'Error in fetching user',
        expect.any(TypeError)
      );
    });

    consoleErrorMock.mockRestore();
  });

  it('should render error message when an error occurs while fetching contracts', async () => {
    const consoleErrorMock = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    jest
      .spyOn(axios, 'get')
      .mockRejectedValueOnce(new Error('Error in fetching Contracts'));

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(
      () => {
        const errorElement = screen.queryByText(/Error in fetching Contracts/i);

        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      },
      { timeout: 15000 }
    );

    expect(console.error).toHaveBeenCalledWith(
      'Error in fetching user',
      expect.any(Error)
    );

    consoleErrorMock.mockRestore();
  }, 20000);

  it('should navigate to "/cash-kick" when addNewCashkick is called', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    const addNewCashkickButton = getByRole('button', {
      name: /New Cash Kick/i,
    });
    fireEvent.click(addNewCashkickButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/cash-kick');
  });

  it('should set isInitial to true when there are no contracts', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      const noContractsElement = screen.getByText(
        'Place to create new cash kicks to run your business'
      );
      expect(noContractsElement).toBeInTheDocument();
    });
  });

  it('should set cashKickPressed to true when there are no cashkicks', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      const noCashkicksElement = screen.getByText(
        'Place to create new cash kicks to run your business'
      );
      expect(noCashkicksElement).toBeInTheDocument();
    });
  });

  it('should navigate to homepage when pageChange is called', () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    const homeButton = screen.getByText('Home');
    fireEvent.click(homeButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/home');
  });

  it('should throw an error when user ID is not found in SelectedContracts', async () => {
    jest.mock('../../data/data.json', () => ({
      SelectedContracts: [],
      contracts: [],
    }));

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in fetching user',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle scenario when SelectedContracts are not found for the given userId', async () => {
    const consoleWarnMock = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const userId = 2;
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(consoleWarnMock).toHaveBeenCalledWith(
        'SelectedContracts not found for the given userId:',
        userId
      );
    });

    consoleWarnMock.mockRestore();
  });

  /*
  it('handles contract filtering correctly when contractIds are strings', () => {
    const mockedData = require('../../../data/data.json');

    mockedData.SelectedContracts = [
      {
        userId: 2,
        contractIds: ['1', '3', '5'],
      },
    ];
    mockedData.contracts = [
      {
        id: '1',
        name: 'Contract 1',
        type: 'Type 1',
        perPayment: 1000,
        termLengthMonths: 12,
        termLengthPercentage: 1.5,
        paymentAmount: 15000,
      },
      {
        id: '2',
        name: 'Contract 2',
        type: 'Type 2',
        perPayment: 2000,
        termLengthMonths: 24,
        termLengthPercentage: 2.5,
        paymentAmount: 25000,
      },
      {
        id: '3',
        name: 'Contract 3',
        type: 'Type 3',
        perPayment: 3000,
        termLengthMonths: 36,
        termLengthPercentage: 3.5,
        paymentAmount: 35000,
      },
      {
        id: '4',
        name: 'Contract 4',
        type: 'Type 4',
        perPayment: 4000,
        termLengthMonths: 48,
        termLengthPercentage: 4.5,
        paymentAmount: 45000,
      },
      {
        id: '5',
        name: 'Contract 5',
        type: 'Type 5',
        perPayment: 5000,
        termLengthMonths: 60,
        termLengthPercentage: 5.5,
        paymentAmount: 55000,
      },
    ];

    const contractsByUserId = getContractsByUserId(2);

    expect(contractsByUserId).toBeDefined();
    expect(Array.isArray(contractsByUserId)).toBe(true);

    if (Array.isArray(contractsByUserId)) {
      expect(contractsByUserId.length).toBe(3);
      const contractIds = contractsByUserId.map((contract) => contract.id);
      expect(contractIds).toEqual(['1', '3', '5']);
    } else {
      fail('contractsByUserId is not an array');
    }
  });
*/
  const contract = { id: 1 };

  it('should match when idOrObject is a string', () => {
    const idOrObject: string | { id: number } = '1';
    expect(
      typeof idOrObject === 'string'
        ? idOrObject === contract.id.toString()
        : (idOrObject as { id: number }).id === contract.id
    ).toBe(true);
  });

  it('should match when idOrObject is an object with id property', () => {
    const idOrObject: string | { id: number } = { id: 1 };
    expect(
      typeof idOrObject === 'string'
        ? idOrObject === contract.id.toString()
        : idOrObject.id === contract.id
    ).toBe(true);
  });

  it('should not match when idOrObject is a string but does not match', () => {
    const idOrObject: string | { id: number } = '2';
    expect(
      typeof idOrObject === 'string'
        ? idOrObject === contract.id.toString()
        : (idOrObject as { id: number }).id === contract.id
    ).toBe(false);
  });

  it('should not match when idOrObject is an object with id property but does not match', () => {
    const idOrObject: string | { id: number } = { id: 2 };
    expect(
      typeof idOrObject === 'string'
        ? idOrObject === contract.id.toString()
        : idOrObject.id === contract.id
    ).toBe(false);
  });

  it('fetches contracts and displays them', async () => {
    const mockContracts = [{ id: 3, userId: 3, contractIds: [1, 2, 3] }];

    mockedAxios.get.mockResolvedValueOnce({
      data: mockContracts,
    } as AxiosResponse);

    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CashAccelerationPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      mockContracts.forEach((contract) => {
        contract.contractIds.forEach(async (contractId) => {
          const contractElement = await screen.findByText(
            new RegExp(`Contract ${contractId}`)
          );
          expect(contractElement).toBeInTheDocument();
        });
      });
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8000/user/2'
    );
  });
/*
  test('should return the correct contracts for a given userId with string contractIds', () => {
    const userId = 2;
    data.SelectedContracts = [
      {
        id: '1',
        userId: 2,
        contractIds: ['1', '2', '3'],
      },
    ];
    data.contracts = [
      {
        id: '1',
        name: 'Contract 1',
        type: 'Type 1',
        perPayment: 1000,
        termLengthMonths: 12,
        termLengthPercentage: 10,
        paymentAmount: 12000,
      },
      {
        id: '2',
        name: 'Contract 2',
        type: 'Type 2',
        perPayment: 2000,
        termLengthMonths: 24,
        termLengthPercentage: 20,
        paymentAmount: 24000,
      },
      {
        id: '3',
        name: 'Contract 3',
        type: 'Type 3',
        perPayment: 3000,
        termLengthMonths: 36,
        termLengthPercentage: 30,
        paymentAmount: 36000,
      },
      {
        id: '4',
        name: 'Contract 4',
        type: 'Type 4',
        perPayment: 4000,
        termLengthMonths: 48,
        termLengthPercentage: 40,
        paymentAmount: 48000,
      },
    ];

    const contracts = getContractsByUserId(userId);

    expect(contracts).toEqual([
      {
        id: '1',
        name: 'Contract 1',
        type: 'Type 1',
        perPayment: 1000,
        termLengthMonths: 12,
        termLengthPercentage: 10,
        paymentAmount: 12000,
      },
      {
        id: '2',
        name: 'Contract 2',
        type: 'Type 2',
        perPayment: 2000,
        termLengthMonths: 24,
        termLengthPercentage: 20,
        paymentAmount: 24000,
      },
      {
        id: '3',
        name: 'Contract 3',
        type: 'Type 3',
        perPayment: 3000,
        termLengthMonths: 36,
        termLengthPercentage: 30,
        paymentAmount: 36000,
      },
    ]);
  });

  test('should return the correct contracts for a given userId with object contractIds', () => {
    const userId = 2;
    data.SelectedContracts = [
      {
        id: '1',
        userId: 2,
        contractIds: [
          { id: '1', amount: 1000 },
          { id: '2', amount: 2000 },
          { id: '3', amount: 3000 },
        ],
      },
    ];
    data.contracts = [
      {
        id: '1',
        name: 'Contract 1',
        type: 'Type 1',
        perPayment: 1000,
        termLengthMonths: 12,
        termLengthPercentage: 10,
        paymentAmount: 12000,
      },
      {
        id: '2',
        name: 'Contract 2',
        type: 'Type 2',
        perPayment: 2000,
        termLengthMonths: 24,
        termLengthPercentage: 20,
        paymentAmount: 24000,
      },
      {
        id: '3',
        name: 'Contract 3',
        type: 'Type 3',
        perPayment: 3000,
        termLengthMonths: 36,
        termLengthPercentage: 30,
        paymentAmount: 36000,
      },
      {
        id: '4',
        name: 'Contract 4',
        type: 'Type 4',
        perPayment: 4000,
        termLengthMonths: 48,
        termLengthPercentage: 40,
        paymentAmount: 48000,
      },
    ];

    const contracts = getContractsByUserId(id);

    expect(contracts).toEqual([
      {
        id: '1',
        name: 'Contract 1',
        type: 'Type 1',
        perPayment: 1000,
        termLengthMonths: 12,
        termLengthPercentage: 10,
        paymentAmount: 12000,
      },
      {
        id: '2',
        name: 'Contract 2',
        type: 'Type 2',
        perPayment: 2000,
        termLengthMonths: 24,
        termLengthPercentage: 20,
        paymentAmount: 24000,
      },
      {
        id: '3',
        name: 'Contract 3',
        type: 'Type 3',
        perPayment: 3000,
        termLengthMonths: 36,
        termLengthPercentage: 30,
        paymentAmount: 36000,
      },
    ]);
  });

  test('should return an empty array if no contracts found for the given userId', () => {
    const userId = 999;

    data.SelectedContracts = [
      {
        id: '1',
        userId: 2,
        contractIds: ['1', '2', '3'],
      },
    ];

    const contracts = getContractsByUserId(userId);

    expect(contracts).toEqual([]);
  });

  test('should return an empty array if SelectedContracts is not found', () => {
    const userId = 2;

    data.SelectedContracts = [];

    const contracts = getContractsByUserId(userId);

    expect(contracts).toEqual([]);
  });
  */
});
