import mainValidator from '../core/validator';

export default (validatorUtils) =>  {
  const conditions = {
    email: validatorUtils.isEmail
  };

  return mainValidator(conditions);
};
