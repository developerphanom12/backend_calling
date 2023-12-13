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



const clientdata = Joi.object({
  client_name: Joi.string().required(),
  company_name: Joi.string().required(), 
  gst_no: Joi.string().required(),
  dob_client : Joi.date().required(),
  client_anniversary : Joi.date(),
  call_schedule_date : Joi.date().required(),
  call_status: Joi.string().valid('cold_lead','hot_lead','prospective_client','ghost_client','negative_client','close_status').required(),
  attach_file : Joi.string()
});

const validateclientdata = (req, res, next) => {

  const { error } = clientdata.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};
;



const Cadata = Joi.object({
  ca_name: Joi.string().required(),
  ca_number: Joi.number().required(), 
  ca_accountant_name: Joi.string().required(),
  ca_company_name : Joi.string().required(),
  ca_accountant_number : Joi.number().required()
});

const validatecadata = (req, res, next) => {

  const { error } = Cadata.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};
;

module.exports = {
    validatetelecaller,
    validateclientdata,
    validatecadata
}