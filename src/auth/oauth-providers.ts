import { isRight } from 'fp-ts/lib/Either';
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

// HID types and cache

const HID_MESSAGE = t.type({
  message: t.string,
});

export const HID_CACHE = new HashTableCache<OAuthResponse>({
  cacheItemLifetimeMs: 5 * 60 * 1000, // 5 minutes
});

// Entra ID types and cache

const ENTRA_ID_JWT = t.intersection([
  t.type({
    // Standard JWT fields
    iss: t.string,
    sub: t.string,
    aud: t.union([t.string, t.array(t.string)]),
    exp: t.number,
    nbf: t.number,
    iat: t.number,

    // Microsoft Entra ID specific fields
    app_displayname: t.string,
    appid: t.string,
    oid: t.string,
    sid: t.string,
    tid: t.string,
    // User info
    name: t.string,
    unique_name: t.string,
    ipaddr: t.string,
  }),
  t.partial({
    family_name: t.string,
    given_name: t.string,
  }),
]);

const MS_GRAPH_API_RESPONSE = t.type({
  /**
   * Unique identifier for the user (Entra ID's "oid" claim)
   * @see https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference#use-claims-to-reliably-identify-a-user
   */
  id: t.string,
  mail: t.string,
  displayName: t.string,
  userPrincipalName: t.string,
});

const GRAPH_API_ERROR = t.type({
  error: t.type({
    code: t.string,
    message: t.string,
  }),
});

const ENTRAID_CACHE = new HashTableCache<OAuthResponse>({
  cacheItemLifetimeMs: 5 * 60 * 1000, // 5 minutes
});

const base64UrlDecode = (str: string): string => {
  const base64 = str
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(str.length / 4) * 4, '=');

  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const isMicrosoftEntraIDToken = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const payloadStr = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadStr);

    const knownIssuers = [
      'https://sts.windows.net',
      'https://login.microsoftonline.com',
    ];

    const decoded = ENTRA_ID_JWT.decode(payload);
    if (!isRight(decoded)) {
      return false;
    }

    const issuer = decoded.right.iss;
    const tid = decoded.right.tid; // Tenant ID

    return knownIssuers.some((base) => {
      const issuerUrl = new URL(issuer);
      const expectedUrl = new URL(`${base}/${tid}/`);

      return issuerUrl.href === expectedUrl.href;
    });
  } catch {
    // If any error occurs (e.g., invalid base64, JSON parse error),
    // we assume it's not a valid Entra ID token
    return false;
  }
};

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

/**
 * Fetches user info from Microsoft Entra ID using the access token in context.
 * Assumes the access token is an OAuth 2.0 Bearer token issued by Entra ID.
 */
export const getEntraInfo = async (
  context: Context
): Promise<UserInfo | undefined> => {
  const { token } = context;

  if (!token) {
    return undefined;
  }

  const existing = ENTRAID_CACHE.get(token);

  if (existing) {
    if (existing.type === 'success') {
      return existing.info;
    }

    throw new ForbiddenError(existing.message);
  } else {
    // Microsoft Graph API endpoint for user profile
    const url = 'https://graph.microsoft.com/v1.0/me';

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const r = await response.json();
        const message = GRAPH_API_ERROR.is(r)
          ? r.error.message
          : 'Invalid Token';
        ENTRAID_CACHE.store(token, { type: 'forbidden', message });
        throw new ForbiddenError(message);
      } else {
        throw new Error(
          `Unexpected error from Entra ID: ${response.statusText}`
        );
      }
    }

    const data = await response.json();
    if (!MS_GRAPH_API_RESPONSE.is(data)) {
      throw new Error('Got invalid data from Entra ID');
    }

    // "id" is the user's object ID (OID), which is globally unique in Entra ID
    // "mail" or "userPrincipalName" can be used for email
    // "displayName" for name
    const info: UserInfo = {
      sub: data.id,
      email: data.mail,
      name: data.displayName,
    };
    ENTRAID_CACHE.store(token, { type: 'success', info });

    return info;
  }
};
