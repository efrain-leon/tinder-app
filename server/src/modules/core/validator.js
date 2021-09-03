import Q from 'q';
import _ from 'underscore';

export default (conditions, prefetchFunction) => {
  prefetchFunction = prefetchFunction || async function(data) {
    try {
      return data;
    }
    catch (err) {
      throw {message: 'Unknown error'}
    }
  };

  async function validate(rootElement) {

    var promises = [];
    var prefetchData;

    function validateProperties(element, conditions, parentProperty) {
      _.forEach(element, (value, property)  => {
        let propertyBreadcrumbs = (parentProperty === '') ? property : parentProperty + '.' + property;
        checkProperty(property, value, conditions, propertyBreadcrumbs);
      });
    }

    function checkProperty(property, value, conditions, parentProperty) {
      if (_.has(conditions, property)) {
        var propertyConditions = conditionsOf(property, value, conditions);

        _.forEach(propertyConditions, condition =>  {
          promises.push(condition(value, parentProperty, rootElement, prefetchData));
        });
      }

      if (_.has(conditions, property + '_validation')) {
        if (_.isArray(value)) {
          var index = 0;
          _.each(value, value => {
            var propertyBreadcrumbs = parentProperty + '[' + index + ']';
            index += 1;
            validateProperties(value, conditions[property + '_validation'], propertyBreadcrumbs);
          });
        } 
        else {
          validateProperties(value, conditions[property + '_validation'], parentProperty);
        }
      }
    }

    function conditionsOf(property, value, conditions) {
      if (_.isArray(conditions[property])) {
        return conditions[property];
      }

      if(_.isObject(conditions[property]) && !_.isFunction(conditions[property])) {
        validateProperties(value, conditions[property], property);
        return;
      }
      return [conditions[property]];
    }

    function collectErrors(results) {
      let rejected = _.where(results, { state: 'rejected'});
      let errors = _.map(rejected, error => { return error.reason; });
      return errors;
    }

    const data = await prefetchFunction(rootElement);
    prefetchData = data;

    validateProperties(rootElement, conditions, '');
    
    const results = await Q.allSettled(promises);

    let errors = collectErrors(results);

    if (!errors.length) {
      return rootElement;
    }

    throw errors;
  }

  return {
    validate: validate,
    conditions: conditions
  };
};