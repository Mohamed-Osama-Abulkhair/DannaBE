import Joi from "joi";

const getDoctorCertificateSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export { getDoctorCertificateSchema };
