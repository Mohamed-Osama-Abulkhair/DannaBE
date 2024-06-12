import Joi from "joi";

const nameValidator = (value, helpers) => {
  const nameParts = value.trim().split(/\s+/); // Split by whitespace and trim extra spaces
  if (nameParts.length !== 4) {
    return helpers.message("Name must contain exactly four parts");
  }
  for (const part of nameParts) {
    if (part.length < 3) {
      return helpers.message(
        "Each part of the Parent Names must be at least 3 characters long"
      );
    }
  }
  return value;
};

const createChildSchema = Joi.object({
  childName: Joi.string()
    .min(3)
    .max(30)
    .required()
    .pattern(/^[^\s]+$/, "single name"),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid("Male", "Female").required(),

  parentNames: Joi.object({
    fatherName: Joi.string().required().custom(nameValidator),
    motherName: Joi.string().required().custom(nameValidator),
  }).required(),

  birthDetails: Joi.object({
    birthWeight: Joi.number().required().min(0),
    bornPrematurely: Joi.boolean().required(),
    pregnancyPeriodPerWeek: Joi.number().required().min(1).max(40),
    motherInfectionDuringPregnancy: Joi.boolean().required(),
    motherTookAntibiotic: Joi.boolean().when("motherInfectionDuringPregnancy", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    complicatedNaturalBirth: Joi.boolean().required(),
    birthComplications: Joi.string().optional().trim(),
  }).required(),

  medicalHistory: Joi.object({
    childDiseases: Joi.array().items(Joi.string()).required(),
    vaccinations: Joi.array().items(Joi.string()).required(),
    allergies: Joi.array().items(Joi.string()).optional(),
    chronicConditions: Joi.array().items(Joi.string()).optional(),
  }).required(),

  familyMedicalHistory: Joi.object({
    motherHasChronicDisease: Joi.boolean().required(),
    fatherHasChronicDisease: Joi.boolean().required(),
    details: Joi.string().optional().trim(),
  }).required(),

  currentHealthStatus: Joi.object({
    weight: Joi.number().required().min(0),
    height: Joi.number().required().min(0),
    bloodType: Joi.string().valid("A", "B", "AB", "O").required(),
    currentMedications: Joi.array().items(Joi.string()).optional(),
    lastCheckupDate: Joi.date().optional(),
    doctorNotes: Joi.string().optional().trim(),
  }).required(),
});

const getChildSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateChildSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  childName: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[^\s]+$/, "single name"),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid("Male", "Female"),

  parentNames: Joi.object({
    fatherName: Joi.string().custom(nameValidator),
    motherName: Joi.string().custom(nameValidator),
  }),

  birthDetails: Joi.object({
    birthWeight: Joi.number().min(0),
    bornPrematurely: Joi.boolean(),
    pregnancyPeriodPerWeek: Joi.number().min(1).max(40),
    motherInfectionDuringPregnancy: Joi.boolean(),
    motherTookAntibiotic: Joi.boolean().when("motherInfectionDuringPregnancy", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    complicatedNaturalBirth: Joi.boolean(),
    birthComplications: Joi.string().optional().trim(),
  }),

  medicalHistory: Joi.object({
    childDiseases: Joi.array().items(Joi.string()),
    vaccinations: Joi.array().items(Joi.string()),
    allergies: Joi.array().items(Joi.string()).optional(),
    chronicConditions: Joi.array().items(Joi.string()).optional(),
  }),

  familyMedicalHistory: Joi.object({
    motherHasChronicDisease: Joi.boolean(),
    fatherHasChronicDisease: Joi.boolean(),
    details: Joi.string().optional().trim(),
  }),

  currentHealthStatus: Joi.object({
    weight: Joi.number().min(0),
    height: Joi.number().min(0),
    bloodType: Joi.string().valid("A", "B", "AB", "O"),
    currentMedications: Joi.array().items(Joi.string()).optional(),
    lastCheckupDate: Joi.date().optional(),
    doctorNotes: Joi.string().optional().trim(),
  }),
});

export { createChildSchema, getChildSchema, updateChildSchema };
