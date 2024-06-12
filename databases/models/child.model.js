import mongoose from "mongoose";

const childSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },

    childName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },

    parentNames: {
      fatherName: {
        type: String,
        required: true,
      },
      motherName: {
        type: String,
        required: true,
      },
    },

    birthDetails: {
      birthWeight: {
        type: Number,
        required: true,
        min: 0,
      },
      bornPrematurely: {
        type: Boolean,
        required: true,
      },
      pregnancyPeriodPerWeek: {
        type: Number,
        required: true,
        min: 1,
        max: 40,
      },
      motherInfectionDuringPregnancy: { type: Boolean, required: true },
      motherTookAntibiotic: {
        type: Boolean,
        required: function () {
          return this.birthDetails.motherInfectionDuringPregnancy === true;
        },
      },
      complicatedNaturalBirth: { type: Boolean, required: true },
      birthComplications: {
        type: String,
        trim: true,
      },
    },

    medicalHistory: {
      childDiseases: {
        type: [String],
        required: true,
      },
      vaccinations: {
        type: [String],
        required: true,
      },
      allergies: {
        type: [String],
      },
      chronicConditions: {
        type: [String],
      },
    },

    familyMedicalHistory: {
      motherHasChronicDisease: {
        type: Boolean,
        required: true,
      },
      fatherHasChronicDisease: {
        type: Boolean,
        required: true,
      },
      details: {
        type: String,
        trim: true,
      },
    },

    currentHealthStatus: {
      weight: {
        type: Number,
        required: true,
        min: 0,
      },
      height: {
        type: Number,
        required: true,
        min: 0,
      },
      bloodType: {
        type: String,
        enum: ["A", "B", "AB", "O"],
        required: true,
      },
      currentMedications: {
        type: [String],
      },
      lastCheckupDate: {
        type: Date,
      },
      doctorNotes: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

childSchema.pre(/^find/, function () {
  this.populate("user", "userName profileImage.url");
});

export const childModel = mongoose.model("child", childSchema);
