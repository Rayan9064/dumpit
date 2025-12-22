# Testing Guide

## Overview
This document covers testing strategies, setup instructions, and best practices for the DumpIt project. The testing stack includes unit tests, integration tests, and Firebase emulator usage for local testing.

## Testing Stack
- **Jest** - JavaScript testing framework
- **React Testing Library** - Component testing
- **Firebase Emulator Suite** - Local Firebase services for testing
- **Supertest** (optional) - API route testing

## Prerequisites
- Node.js 18+ installed
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Project dependencies installed: `npm install`

## Running Tests

### Unit Tests
Run all unit tests:
```bash
npm test
```

Run tests in watch mode (for development):
```bash
npm test -- --watch
```

Run tests with coverage report:
```bash
npm test -- --coverage
```

### Integration Tests
Run integration tests (requires emulator):
```bash
npm run test:integration
```

### End-to-End Tests
If E2E tests are configured:
```bash
npm run test:e2e
```

## Firebase Emulator Setup

The Firebase Emulator Suite allows you to test Firestore, Authentication, and other Firebase services locally without affecting production data.

### Installation
Firebase CLI should already be installed globally. If not:
```bash
npm install -g firebase-tools
```

### Initialize Emulators
If not already initialized:
```bash
firebase init emulators
```

Select the following emulators:
- ✅ Authentication Emulator
- ✅ Firestore Emulator
- ✅ (Optional) Functions Emulator

Use default ports:
- Authentication: `9099`
- Firestore: `8080`
- Emulator UI: `4000`

### Start Emulators
Start all configured emulators:
```bash
firebase emulators:start
```

Start specific emulators:
```bash
firebase emulators:start --only firestore,auth
```

Start with import/export (to persist data between sessions):
```bash
firebase emulators:start --import=./emulator-data --export-on-exit
```

### Emulator UI
Once started, access the Emulator UI at:
```
http://localhost:4000
```

The UI allows you to:
- View and edit Firestore data
- Manage test users
- Monitor emulator logs
- Clear emulator data

### Connecting to Emulators

#### For Local Development
Update your `.env.local` to use emulators:
```bash
# Add these to connect to emulators
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

#### For Tests
Tests should automatically connect to emulators. Ensure your test setup includes:

```javascript
// jest.setup.js or test setup file
if (process.env.NODE_ENV === 'test') {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}
```

## Test Structure

### Directory Layout
```
dumpit/
├── __tests__/              # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── app/                   # Next.js app directory
│   └── api/              # API routes to test
├── components/            # React components to test
└── lib/                  # Utility functions to test
```

### Naming Conventions
- Test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`
- Place tests next to the code they test, or in `__tests__/` directory
- Example: `components/ResourceCard.tsx` → `components/ResourceCard.test.tsx`

## Writing Tests

### Unit Test Example (Component)
```typescript
// components/ResourceCard.test.tsx
import { render, screen } from '@testing-library/react';
import ResourceCard from './ResourceCard';

describe('ResourceCard', () => {
  const mockResource = {
    id: '1',
    title: 'Test Resource',
    link: 'https://example.com',
    tag: 'test',
    is_public: false,
  };

  it('renders resource title', () => {
    render(<ResourceCard resource={mockResource} />);
    expect(screen.getByText('Test Resource')).toBeInTheDocument();
  });

  it('displays the correct link', () => {
    render(<ResourceCard resource={mockResource} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
});
```

### Unit Test Example (Utility Function)
```typescript
// lib/utils.test.ts
import { formatDate, validateUrl } from './utils';

describe('utils', () => {
  describe('formatDate', () => {
    it('formats timestamp correctly', () => {
      const timestamp = new Date('2024-01-01T00:00:00Z');
      expect(formatDate(timestamp)).toBe('Jan 1, 2024');
    });
  });

  describe('validateUrl', () => {
    it('returns true for valid URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
    });
  });
});
```

### Integration Test Example (API Route)
```typescript
// __tests__/integration/api/resources.test.ts
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('POST /api/resources', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        host: 'localhost',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it('creates a new resource', async () => {
    const authenticatedContext = testEnv.authenticatedContext('user123');
    const db = authenticatedContext.firestore();

    const resourceData = {
      user_id: 'user123',
      title: 'Test Resource',
      link: 'https://example.com',
      tag: 'test',
      is_public: false,
    };

    const docRef = await db.collection('resources').add(resourceData);
    const doc = await docRef.get();

    expect(doc.exists).toBe(true);
    expect(doc.data()?.title).toBe('Test Resource');
  });
});
```

### Testing Firestore Security Rules
```typescript
// __tests__/integration/firestore-rules.test.ts
import { 
  initializeTestEnvironment, 
  assertSucceeds, 
  assertFails 
} from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        host: 'localhost',
        port: 8080,
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('resources collection', () => {
    it('allows user to read their own resources', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const db = alice.firestore();
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('resources').doc('res1').set({
          user_id: 'alice',
          title: 'Alice Resource',
          is_public: false,
        });
      });

      await assertSucceeds(
        db.collection('resources').doc('res1').get()
      );
    });

    it('prevents user from reading others private resources', async () => {
      const bob = testEnv.authenticatedContext('bob');
      const db = bob.firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('resources').doc('res1').set({
          user_id: 'alice',
          title: 'Alice Private Resource',
          is_public: false,
        });
      });

      await assertFails(
        db.collection('resources').doc('res1').get()
      );
    });

    it('allows anyone to read public resources', async () => {
      const unauthenticated = testEnv.unauthenticatedContext();
      const db = unauthenticated.firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('resources').doc('res1').set({
          user_id: 'alice',
          title: 'Public Resource',
          is_public: true,
        });
      });

      await assertSucceeds(
        db.collection('resources').doc('res1').get()
      );
    });
  });
});
```

## Test Configuration

### Jest Configuration
Create or update `jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### Jest Setup File
Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';

// Set up Firebase emulators for tests
if (process.env.NODE_ENV === 'test') {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));
```

## Testing Best Practices

### General Guidelines
1. **Write tests first** (TDD approach when possible)
2. **Test behavior, not implementation** - Focus on what the code does, not how
3. **Keep tests isolated** - Each test should be independent
4. **Use descriptive test names** - Clearly state what is being tested
5. **Follow AAA pattern** - Arrange, Act, Assert

### Component Testing
- Test user interactions (clicks, form submissions)
- Test conditional rendering
- Test props and state changes
- Mock external dependencies (API calls, Firebase)

### API Testing
- Test all HTTP methods (GET, POST, PUT, DELETE)
- Test authentication and authorization
- Test error handling (400, 401, 404, 500)
- Test edge cases and validation

### Firebase Testing
- Always use emulators for tests (never test against production)
- Clear emulator data between tests
- Test security rules thoroughly
- Test data validation and constraints

## Continuous Integration

### GitHub Actions Example
Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Firebase CLI
        run: npm install -g firebase-tools
      
      - name: Start Firebase Emulators
        run: firebase emulators:start --only firestore,auth &
        
      - name: Wait for emulators
        run: sleep 10
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Troubleshooting

### Common Issues

**Tests fail with "Cannot find module"**
- Check `moduleNameMapper` in `jest.config.js`
- Ensure path aliases match `tsconfig.json`

**Emulator connection refused**
- Verify emulators are running: `firebase emulators:start`
- Check ports are not in use: `lsof -i :8080` (Mac/Linux) or `netstat -ano | findstr :8080` (Windows)

**Tests timeout**
- Increase Jest timeout: `jest.setTimeout(10000)` in setup file
- Check for unresolved promises in tests

**Security rules tests fail**
- Ensure `firestore.rules` file exists and is valid
- Load rules in test environment initialization
- Clear emulator data between tests

## Code Coverage

### Viewing Coverage Reports
After running tests with coverage:
```bash
npm test -- --coverage
```

Open the HTML report:
```bash
# Mac/Linux
open coverage/lcov-report/index.html

# Windows
start coverage/lcov-report/index.html
```

### Coverage Goals
Aim for:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

## Additional Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Testing Firestore Security Rules](https://firebase.google.com/docs/rules/unit-tests)
- [Next.js Testing](https://nextjs.org/docs/testing)
