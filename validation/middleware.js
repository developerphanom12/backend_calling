const  Joi = require('joi');

const createtellecaller = Joi.object({
  username: Joi.string().required(),
  passsword: Joi.string().required(), 
  email: Joi.string().email().required(),
});

const validatetelecaller = (req, res, next) => {

  const { error } = createtellecaller.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = {
    validatetelecaller
}