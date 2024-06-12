import mongoose from "mongoose";

const hospitalSchema = mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ["Point", "LineString", "Polygon"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coords) {
            return coords.length === 2;
          },
          message:
            "Coordinates must be an array of two numbers [longitude, latitude].",
        },
      },
    },

    address: {
      type: String,
      required: [true, "hospital address is required"],
    },

    availableIncubations: {
      type: Number,
      min: 0,
      default: 0,
    },

    hospital: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  },

  { timestamps: true }
);

hospitalSchema.index({ location: "2dsphere" });

hospitalSchema.pre(/^find/, function () {
  this.populate("hospital", "userName profileImage.url");
}); 

export const hospitalModel = mongoose.model("hospital", hospitalSchema);
