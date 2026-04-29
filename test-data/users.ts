// test-data/users.ts
export const USERS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  performance: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
  invalid: {
    username: 'invalid_user',
    password: 'wrong_password',
  },
  emptyUsername: {
    username: '',
    password: 'secret_sauce',
  },
  emptyPassword: {
    username: 'standard_user',
    password: '',
  },
  emptyBoth: {
    username: '',
    password: '',
  },
};

export const CHECKOUT_INFO = {
  valid: {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '10110',
  },
  emptyFirstName: {
    firstName: '',
    lastName: 'Doe',
    postalCode: '10110',
  },
  emptyLastName: {
    firstName: 'John',
    lastName: '',
    postalCode: '10110',
  },
  emptyPostalCode: {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '',
  },
};

export const SORT_OPTIONS = {
  nameAZ: 'az',
  nameZA: 'za',
  priceLowHigh: 'lohi',
  priceHighLow: 'hilo',
} as const;

export const EXPECTED_MESSAGES = {
  login: {
    invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
    emptyUsername: 'Epic sadface: Username is required',
    emptyPassword: 'Epic sadface: Password is required',
  },
  checkout: {
    emptyFirstName: 'Error: First Name is required',
    emptyLastName: 'Error: Last Name is required',
    emptyPostalCode: 'Error: Postal Code is required',
  },
};
