import * as t from 'io-ts';
import { URL } from 'node:url';
import { type Context } from '../lib/context';
import { ForbiddenError } from '../util/error';
import { HashTableCache } from './cache';

const USER_INFO = t.type({
  sub: t.string,
  name: t.string,
  email: t.string,
});
const HID_MESSAGE = t.type({
  message: t.string,
});

export type UserInfo = t.TypeOf<typeof USER_INFO>;

export type OAuthResponse =
  | {
      type: 'success';
      info: UserInfo;
    }
  | {
      type: 'forbidden';
      message: string;
    };

export const HID_CACHE = new HashTableCache<OAuthResponse>({
  cacheItemLifetimeMs: 5 * 60 * 1000, // 5 minutes
});

/**
 * Use HID token to determine what HID user is logged-in as by
 * requesting account information from HID using the token.
 */
export const getHidInfo = async (
  context: Context
): Promise<UserInfo | undefined> => {
  const { config, token } = context;

  if (!token) {
    return undefined;
  }

  const existing = HID_CACHE.get(token);

  if (existing) {
    if (existing.type === 'success') {
      return existing.info;
    }

    throw new ForbiddenError(existing.message);
  } else {
    const accountUrl = new URL('/account.json', config.authBaseUrl);
    const res = await fetch(accountUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        const r = await res.json();
        const message = HID_MESSAGE.is(r) ? r.message : 'Invalid Token';
        HID_CACHE.store(token, { type: 'forbidden', message });
        throw new ForbiddenError(message);
      } else {
        throw new Error(`Unexpected error from HID: ${res.statusText}`);
      }
    }
    const data = await res.json();
    if (!USER_INFO.is(data)) {
      throw new Error('Got invalid data from HID');
    }
    const info: UserInfo = {
      sub: data.sub,
      name: data.name,
      email: data.email,
    };
    HID_CACHE.store(token, { type: 'success', info });

    return info;
  }
};
