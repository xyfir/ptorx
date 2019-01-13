import { teardownTests } from 'lib/tests/teardown';
import { setupTests } from 'lib/tests/setup';

beforeAll(setupTests);
afterAll(teardownTests);
