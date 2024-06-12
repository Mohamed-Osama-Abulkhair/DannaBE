import Joi from "joi";

const createIncubationReserveSchema = Joi.object({
  incubation: Joi.string().hex().length(24).required(),
  child: Joi.string().hex().length(24).required(),

  reasonForReservation: Joi.string()
    .valid(
      "Jaundice",
      "Premature Birth",
      "Heart Problems",
      "Respiratory Problems",
      "Down Syndrome",
      "Other"
    )
    .required(),

  otherReason: Joi.string().when("reasonForReservation", {
    is: "Other",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  reasonForPrematureBirth: Joi.string().when("reasonForReservation", {
    is: "Premature Birth",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  notes: Joi.string().optional().trim(),

  phoneNumber: Joi.string()
    .required()
    .length(11)
    .pattern(new RegExp("^(012|010|011|015)\\d{8}$"), "egyptian numbers only"),
});

const getIncubationReserveSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const getNearIncubationSchema = Joi.object({
  long: Joi.number().min(-180).max(180).required(),
  lat: Joi.number().min(-90).max(90).required(),
  distance: Joi.number().min(0),
});

export {
  createIncubationReserveSchema,
  getIncubationReserveSchema,
  getNearIncubationSchema,
};
