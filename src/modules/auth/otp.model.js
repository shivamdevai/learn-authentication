import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    otpHash: {
      type: String,
      required: [true, "Otp hash is required"],
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);

export default Otp;
