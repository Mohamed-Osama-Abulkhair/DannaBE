import mongoose from "mongoose";

const incubationReservationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    incubation: {
      type: mongoose.Types.ObjectId,
      ref: "incubation",
      required: true,
    },
    child: {
      type: mongoose.Types.ObjectId,
      ref: "child",
      required: true,
    },
    hospital: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },

    reasonForReservation: {
      type: String,
      enum: [
        "Jaundice",
        "Premature Birth",
        "Heart Problems",
        "Respiratory Problems",
        "Down Syndrome",
        "Other",
      ],
      required: true,
    },

    otherReason: {
      type: String,
      required: function () {
        return this.reasonForReservation === "Other";
      },
    },

    reasonForPrematureBirth: {
      type: String,
      required: function () {
        return this.infantDisease === "Premature Birth";
      },
    },

    notes: {
      type: String,
    },

    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

incubationReservationSchema.pre(/^find/, function () {
  this.populate("user", "userName profileImage.url email");
  this.populate("incubation");
  this.populate("child");
});

export const incubationReservationModel = mongoose.model(
  "incubationReservation",
  incubationReservationSchema
);
