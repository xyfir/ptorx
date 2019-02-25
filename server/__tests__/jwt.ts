import 'lib/tests/prepare';
import { verifyJWT } from 'lib/jwt/verify';
import { signJWT } from 'lib/jwt/sign';

test('sign and verify jwt', async () => {
  const encoded = await signJWT(
    { userId: 1234, email: 'test@example.com' },
    '1m'
  );
  const decoded = await verifyJWT(encoded);
  expect(decoded.userId).toBe(1234);
  expect(decoded.email).toBe('test@example.com');
});
