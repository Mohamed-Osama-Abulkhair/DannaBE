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
      minLength: [8, "minlength must be greater than 7 characters"],
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
  },

  { timestamps: true }
);

userSchema.pre("save", function () {
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
