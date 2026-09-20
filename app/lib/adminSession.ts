export interface AdminSession {
  adminId: string;
  role: string;
  staffId: string | null;
  branchId: string | null;
  staffName: string | null;
  credentialVersion: number;
  mustChangeCredential: boolean;
  issuedAt: number;
  expiresAt: number;
  version: 1;
}

interface CreateAdminSessionInput {
  adminId: string;
  role: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
  credentialVersion: number;
  mustChangeCredential: boolean;
}

const DEFAULT_SESSION_SECONDS =
  8 * 60 * 60;

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET;

  if (
    !secret ||
    secret.length < 32
  ) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be configured with at least 32 characters."
    );
  }

  return secret;
}

function bytesToBase64Url(
  bytes: Uint8Array
) {
  let binary = "";

  for (
    const byte of bytes
  ) {
    binary +=
      String.fromCharCode(
        byte
      );
  }

  return btoa(
    binary
  )
    .replace(
      /\+/g,
      "-"
    )
    .replace(
      /\//g,
      "_"
    )
    .replace(
      /=+$/g,
      ""
    );
}

function base64UrlToBytes(
  value: string
) {
  const base64 =
    value
      .replace(
        /-/g,
        "+"
      )
      .replace(
        /_/g,
        "/"
      );

  const paddingLength =
    (
      4 -
      (
        base64.length %
        4
      )
    ) %
    4;

  const padded =
    base64 +
    "=".repeat(
      paddingLength
    );

  const binary =
    atob(
      padded
    );

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let index = 0;
    index <
    binary.length;
    index++
  ) {
    bytes[index] =
      binary.charCodeAt(
        index
      );
  }

  return bytes;
}

function encodePayload(
  session: AdminSession
) {
  const json =
    JSON.stringify(
      session
    );

  const bytes =
    new TextEncoder().encode(
      json
    );

  return bytesToBase64Url(
    bytes
  );
}

function decodePayload(
  encodedPayload: string
) {
  const bytes =
    base64UrlToBytes(
      encodedPayload
    );

  const json =
    new TextDecoder().decode(
      bytes
    );

  return JSON.parse(
    json
  ) as unknown;
}

async function getSigningKey() {
  const secret =
    getSessionSecret();

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(
      secret
    ),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    [
      "sign",
      "verify",
    ]
  );
}

async function signPayload(
  encodedPayload: string
) {
  const key =
    await getSigningKey();

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(
        encodedPayload
      )
    );

  return bytesToBase64Url(
    new Uint8Array(
      signature
    )
  );
}

function isValidSessionShape(
  value: unknown
): value is AdminSession {
  if (
    typeof value !==
      "object" ||
    value ===
      null
  ) {
    return false;
  }

  const session =
    value as Partial<AdminSession>;

  return (
    typeof session.adminId ===
      "string" &&
    session.adminId.length >
      0 &&
    typeof session.role ===
      "string" &&
    session.role.length >
      0 &&
    (
      session.staffId ===
        null ||
      typeof session.staffId ===
        "string"
    ) &&
    (
      session.branchId ===
        null ||
      typeof session.branchId ===
        "string"
    ) &&
    (
      session.staffName ===
        null ||
      typeof session.staffName ===
        "string"
    ) &&
    typeof session.credentialVersion ===
      "number" &&
    Number.isInteger(
      session.credentialVersion
    ) &&
    session.credentialVersion >
      0 &&
    typeof session.mustChangeCredential ===
      "boolean" &&
    typeof session.issuedAt ===
      "number" &&
    Number.isFinite(
      session.issuedAt
    ) &&
    typeof session.expiresAt ===
      "number" &&
    Number.isFinite(
      session.expiresAt
    ) &&
    session.version ===
      1
  );
}

export async function createAdminSessionToken(
  input: CreateAdminSessionInput,
  sessionSeconds =
    DEFAULT_SESSION_SECONDS
) {
  if (
    !input.adminId ||
    !input.role
  ) {
    throw new Error(
      "Admin session requires adminId and role."
    );
  }

  if (
    !Number.isInteger(
      input.credentialVersion
    ) ||
    input.credentialVersion <=
      0
  ) {
    throw new Error(
      "Admin session requires a valid credential version."
    );
  }

  if (
    typeof input.mustChangeCredential !==
    "boolean"
  ) {
    throw new Error(
      "Admin session requires mustChangeCredential."
    );
  }

  if (
    !Number.isInteger(
      sessionSeconds
    ) ||
    sessionSeconds <=
      0
  ) {
    throw new Error(
      "Admin session duration must be a positive whole number."
    );
  }

  const now =
    Math.floor(
      Date.now() /
      1000
    );

  const session: AdminSession =
    {
      adminId:
        input.adminId,

      role:
        input.role,

      staffId:
        input.staffId ??
        null,

      branchId:
        input.branchId ??
        null,

      staffName:
        input.staffName ??
        null,

      credentialVersion:
        input.credentialVersion,

      mustChangeCredential:
        input.mustChangeCredential,

      issuedAt:
        now,

      expiresAt:
        now +
        sessionSeconds,

      version:
        1,
    };

  const encodedPayload =
    encodePayload(
      session
    );

  const signature =
    await signPayload(
      encodedPayload
    );

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const parts =
      token.split(
        "."
      );

    if (
      parts.length !==
      2
    ) {
      return null;
    }

    const [
      encodedPayload,
      encodedSignature,
    ] = parts;

    if (
      !encodedPayload ||
      !encodedSignature
    ) {
      return null;
    }

    const key =
      await getSigningKey();

    const signature =
      base64UrlToBytes(
        encodedSignature
      );

    const validSignature =
      await crypto.subtle.verify(
        "HMAC",
        key,
        signature,
        new TextEncoder().encode(
          encodedPayload
        )
      );

    if (
      !validSignature
    ) {
      return null;
    }

    const decoded =
      decodePayload(
        encodedPayload
      );

    if (
      !isValidSessionShape(
        decoded
      )
    ) {
      return null;
    }

    const now =
      Math.floor(
        Date.now() /
        1000
      );

    if (
      decoded.expiresAt <=
        now
    ) {
      return null;
    }

    if (
      decoded.issuedAt >
      now +
        60
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
