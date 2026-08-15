import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

// 创建密码 Hash
export function hashPassword(
  password: string
) {
  const salt =
    randomBytes(16).toString("hex");

  const hash =
    scryptSync(
      password,
      salt,
      64
    ).toString("hex");

  return `${salt}:${hash}`;
}


// 验证密码
export function verifyPassword(
  password: string,
  storedHash: string
) {
  const [salt, hash] =
    storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const storedBuffer =
    Buffer.from(hash, "hex");

  const suppliedBuffer =
    scryptSync(
      password,
      salt,
      64
    );

  if (
    storedBuffer.length !==
    suppliedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    storedBuffer,
    suppliedBuffer
  );
}