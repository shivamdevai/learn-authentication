export const cookieOptions = {
  httpOnly: true,
  secure: false, // in production secure is true
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
