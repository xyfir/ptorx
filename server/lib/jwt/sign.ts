import { sign, SignOptions } from 'jsonwebtoken';

export function signJWT(
  payload: any,
  expiresIn: SignOptions['expiresIn']
): Promise<string> {
  return new Promise((resolve, reject) =>
    sign(payload, process.enve.JWT_KEY, { expiresIn }, (err, token) =>
      err ? reject(err) : resolve(token)
    )
  );
}
