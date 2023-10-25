import * as t from 'io-ts';
import * as fetch from 'node-fetch';
import { URL } from 'node:url';

import { type Context } from '../lib/context';
import { ForbiddenError } from '../util/error';
import { HashTableCache } from './cache';

const HID_ACCOUNT_INFO = t.type({
  sub: t.string,
  name: t.string,
  email: t.string,
});

// Exported for mocking purposes in tests
export { fetch };

export type HIDInfo = t.TypeOf<typeof HID_ACCOUNT_INFO>;

export type HIDResponse =
  | {
      type: 'success';
      info: HIDInfo;
    }
  | {
      type: 'forbidden';
      message: string;
    };

export const HID_CACHE = new HashTableCache<HIDResponse>({
  cacheItemLifetimeMs: 5 * 60 * 1000, // 5 minutes
});

/**
 * Use HID token to determine what HID user is logged-in as by
 * requesting account information from HID using the token.
 */
export const getHidInfo = async (
  context: Context
): Promise<HIDInfo | undefined> => {
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
    // Reference fetch.default to allow for mocking
    const res = await fetch.default(accountUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        const r = await res.json();
        const message = r.message || 'Invalid Token';
        HID_CACHE.store(token, { type: 'forbidden', message });
        throw new ForbiddenError(message);
      } else {
        throw new Error(`Unexpected error from HID: ${res.statusText}`);
      }
    }
    const data = await res.json();
    if (!HID_ACCOUNT_INFO.is(data)) {
      throw new Error('Got invalid data from HID');
    }
    const info: HIDInfo = {
      sub: data.sub,
      name: data.name,
      email: data.email,
    };
    HID_CACHE.store(token, { type: 'success', info });

    return info;
  }
};
