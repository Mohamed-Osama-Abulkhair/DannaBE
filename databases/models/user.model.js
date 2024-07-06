import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    fName: {
      type: String,
      trim: true,
      required: [true, "user name required"],
      minLength: [3, "too short user name"],
    },

    lName: {
      type: String,
      trim: true,
      required: [true, "user name required"],
      minLength: [3, "too short user name"],
    },

    userName: {
      type: String,
    },

    email: {
      type: String,
      trim: true,
      required: [true, "email required"],
      minLength: [5, "too short email"],
      maxLength: [100, "too long email"],
      unique: [true, "email must be unique"],
      lowercase: true,
      validate: {
        validator: function (value) {
          // Regular expression for basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format.",
      },
    },

    password: {
      type: String,
      required: true,
      minLength: [8, "password must be greater than 7 characters"],
    },

    forgetPasswordOTP: {
      otp: Number,
      createdAt: Date,
    },

    passwordChangedAt: Date,
    emailChangedAt: Date,
    loginChangedAt: Date,

    // phone: {
    //   type: String,
    //   unique: [true, "phone must be unique"],
    //   trim: true,
    // },

    role: {
      type: String,
      enum: ["admin", "user", "doctor", "hospital"],
      default: "user",
    },

    login: { type: Boolean, default: false },
    confirmedEmail: { type: Boolean, default: false },

    wishlist: [
      {
        type: mongoose.Types.ObjectId,
        ref: "product",
      },
    ],
    addresses: [
      {
        city: String,
        street: String,
        phone: String,
      },
    ],

    profileImage: {
      id: { type: String },
      url: { type: String },
    },

    stripeAccountId: {
      type: String,
    },
    stripeAccountVerified: Boolean,

    inCall: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
    },

    doctorPrice: {
      type: Number,
      min: 1,
    },

    doctorCertificated: {
      type: Boolean,
      default: false,
    },

    friends: [{ type: mongoose.Types.ObjectId, ref: "user" }],
  },

  { timestamps: true }
);

userSchema.pre("save", function () {
  if (this.password)
    this.password = bcrypt.hashSync(this.password, Number(process.env.Round));
});

userSchema.pre("findOneAndUpdate", function () {
  if (this._update.password)
    this._update.password = bcrypt.hashSync(
      this._update.password,
      Number(process.env.Round)
    );
});

export const userModel = mongoose.model("user", userSchema);
