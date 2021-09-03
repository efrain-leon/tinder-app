import mainValidator from '../core/validator';

export default (validatorUtils) => {
  const conditions = {
    url: [validatorUtils.notEmpty]
  };

  return mainValidator(conditions);
}