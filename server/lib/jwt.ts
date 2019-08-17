import { SignOptions, verify, sign } from 'jsonwebtoken';

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

export function verifyJWT(jwt: string): Promise<any> {
  return new Promise((resolve, reject) =>
    verify(jwt, process.enve.JWT_KEY, {}, (e, t) =>
      e ? reject(e) : resolve(t)
    )
  );
}
