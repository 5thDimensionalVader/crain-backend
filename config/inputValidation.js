const Yup = require('yup');

// Yup register schema for input validation
const registerSchema = Yup.object().shape({
  name: Yup.string().required(),
  age: Yup.number().required().positive().integer(),
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

const loginSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

module.exports = { registerSchema, loginSchema };