import { JWT_KEY } from 'constants/config';
import { verify } from 'jsonwebtoken';

export function verifyJWT(jwt: string): Promise<any> {
  return new Promise((resolve, reject) =>
    verify(jwt, JWT_KEY, {}, (e, t) => (e ? reject(e) : resolve(t)))
  );
}
