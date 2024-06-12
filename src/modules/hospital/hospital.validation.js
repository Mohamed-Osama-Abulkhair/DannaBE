import Joi from "joi";

const createHospitalLocationSchema = Joi.object({
  location: Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array()
      .items(
        Joi.number().min(-180).max(180).required(), // Longitude
        Joi.number().min(-90).max(90).required() // Latitude
      )
      .length(2)
      .required(),
  }).required(),
  address: Joi.string().required(),
});

const getHospitalLocationSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateHospitalLocationSchema = Joi.object({
  location: Joi.object({
    type: Joi.string().valid("Point"),
    coordinates: Joi.array()
      .items(Joi.number().min(-180).max(180), Joi.number().min(-90).max(90))
      .length(2),
  }),
  address: Joi.string(),
});

export {
  createHospitalLocationSchema,
  getHospitalLocationSchema,
  updateHospitalLocationSchema,
};
