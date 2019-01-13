import { teardownTests } from 'lib/tests/teardown';
import { setupTests } from 'lib/tests/setup';
import 'jest-extended';

beforeAll(setupTests);
afterAll(teardownTests);
