import validator from 'validator';
import Q from 'q';
import _ from 'underscore';

const validatorUtils = {
  notEmpty: Q.fbind(function(value, property) {
    try {
      if (typeof(value) === 'object') {
        if (_.isEmpty(value)) {
          throw { message: 'empty', value: value, property: property };
        }
      }

      validator.trim(value);
    }
    catch(error) {
      throw { message: 'empty', value: value, property: property };
    }
  }),

  isAlpha: Q.fbind(function(value, property) {
    try {
      if (value !== '') {
        validator.whitelist(value, /^[A-Za-zÑñÁáÉéÍíÓóÚúÜü ]+$/);
      }
    }
    catch(error) {
      throw { message: 'invalid_string', value: value, property: property };
    }
  }),

  isBoolean: Q.fbind(function(value, property) {
    try {
      if (value !== '') {
        validator.whitelist(value, /^(0|1|true|false)$/);
      }
    }
    catch(error) {
      throw { message: 'invalid_boolean', value: value, property: property };
    }
  }),

  isEmail: Q.fbind(function(value, property) {
    try {
      if (value !== '') {
        validator.isEmail(value);
      }
    }
    catch(error) {
      throw { message: 'invalid_email', value: value, property: property };
    }
  })
};

export default validatorUtils;
