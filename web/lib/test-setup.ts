import { config } from 'dotenv';
config();
import 'enve';
import 'jest-extended';

beforeEach(() => {
  const content = document.createElement('div');
  content.id = 'content';
  document.body.appendChild(content);
});
