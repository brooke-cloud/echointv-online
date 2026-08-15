import {
  hashPassword,
} from "../lib/password";

const password =
  process.argv[2];

if (!password) {
  console.error(
    "Please provide a password."
  );

  process.exit(1);
}

const hash =
  hashPassword(password);

console.log("\nADMIN_PASSWORD_HASH=");
console.log(hash);
console.log();