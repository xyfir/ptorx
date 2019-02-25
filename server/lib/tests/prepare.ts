import 'app-module-path/register';
import { config } from 'dotenv';
config();
import 'enve';

import { teardownTests } from 'lib/tests/teardown';
import { setupTests } from 'lib/tests/setup';
import 'jest-extended';

beforeAll(setupTests);
afterAll(teardownTests);
