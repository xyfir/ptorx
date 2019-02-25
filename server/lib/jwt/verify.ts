import { verify } from 'jsonwebtoken';

export function verifyJWT(jwt: string): Promise<any> {
  return new Promise((resolve, reject) =>
    verify(jwt, process.enve.JWT_KEY, {}, (e, t) =>
      e ? reject(e) : resolve(t)
    )
  );
}
