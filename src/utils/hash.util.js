import bcrypt from "bcryptjs";

export const hashString = async (value) => {
  const hashValue = await bcrypt.hash(value, 10);
  return hashValue;
};

export const compareHash = async (plainValue, hashedValue) => {
  return await bcrypt.compare(plainValue, hashedValue);
};
