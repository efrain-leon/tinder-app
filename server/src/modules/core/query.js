import Q from 'q';
import _ from 'underscore';

const defaultQuery = (mongooseQuery) => {
  return {
    globalSearch: async () => {
      return Q({});
    },

    paginate: function(page, perPage) {
      if (page && perPage) {
        let skip = (page - 1) * perPage;
        mongooseQuery.skip(skip).limit(perPage);
      }
    },

    select: function(select) {
      if(select) {
        mongooseQuery.select(select);
      }
    },

    exists: function(exists) {
      if (exists) {
        _.each(exists, exists => {
          mongooseQuery.exists(exists.property, true);
        });
      }
    },

    sort: function(sort) {
      if (sort) {
        mongooseQuery.sort(sort);
      }
    },

    lean: function(lean) {
      if (lean) {
        mongooseQuery.lean();
      }
    },
    or: function(or) {
      if (or) {
        mongooseQuery.or(or);
      }
    },
    ne: function(ne) {
      if (ne) {
        mongooseQuery.ne(ne);
      }
    },
    elemMatch: function(elemMatch) {
      if (elemMatch) {
        if (_.isArray(elemMatch)) {
          _.each(elemMatch, elem => {
            mongooseQuery.elemMatch(elem.property, elem.parameters);
          });
        }
        else {
          mongooseQuery.elemMatch(elemMatch.property, elemMatch.parameters);
        }
      }
    },

    populate: function(populate, populateFunction) {
      if (populate === true) {
        mongooseQuery = populateFunction(mongooseQuery);
      }

      if (_.isArray(populate)) {
        _.each(populate, _populate => {
         this.buildPopulate(_populate);
        })
      }
      else if (_.isObject(populate)) {
        this.buildPopulate(populate);
      }
    },

    buildPopulate(populate) {
      if ('path' in populate) {
        mongooseQuery.populate(populate);
        return;
      }
    
      _.each(populate, (properties, reference) => {
    
        if (_.isString(properties)) {
          let splittedProperties = _.without(properties.split(' '), '');
    
          let excluding = _.reduce(splittedProperties, (memo, property) => {
            return (memo || (property.indexOf('-') !== -1 && property !== '-_id'));
          }, false);
    
          if (!splittedProperties.length || excluding) {
            splittedProperties.push('-password');
          }
    
          properties = _.without(splittedProperties, 'password').join(' ');
        }
        mongooseQuery.populate(reference, properties);
      });
    }
  };
};

export default defaultQuery;