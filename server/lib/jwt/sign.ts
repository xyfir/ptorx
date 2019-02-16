import { sign, SignOptions } from 'jsonwebtoken';
import { JWT_KEY } from 'constants/config';

export function signJWT(
  payload: any,
  expiresIn: SignOptions['expiresIn']
): Promise<string> {
  return new Promise((resolve, reject) =>
    sign(payload, JWT_KEY, { expiresIn }, (err, token) =>
      err ? reject(err) : resolve(token)
    )
  );
}
