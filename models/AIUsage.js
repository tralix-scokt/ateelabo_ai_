
import mongoose from "mongoose";

const aiUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // AI provider: OpenAI or Gemini
    provider: {
      type: String,
      enum: ["openai", "gemini"],
      default: "openai",
      index: true,
    },

    // Actual model used for the request
    model: {
      type: String,
      default: "gpt-4o-mini",
    },

    status: {
      type: String,
      enum: ["success"],
      default: "success",
    },

    promptTokens: {
      type: Number,
      default: 0,
    },

    completionTokens: {
      type: Number,
      default: 0,
    },

    totalTokens: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const AIUsage = mongoose.model("AIUsage", aiUsageSchema);

export default AIUsage;
