import _ from 'underscore';

const prepareRouter = (router, model, path) => {

  function extractParams(searchQuery) {
    let parameters = {};

    _.each(searchQuery, (value, key) => {
      if (key.match('__')) {
        parameters[key.replace('__', '')] = parse(value);
        delete(searchQuery[key]);
      }
    });
  
    if (searchQuery.likePattern) {
      let likePattern = parse(searchQuery.likePattern);
  
      _.each(likePattern, (value, key) => {
        searchQuery[key] = { $regex: new RegExp(value, "i") } ;
      });
    }
  
    delete(searchQuery.likePattern);

    if (searchQuery.comparisonQuery) {
      let comparisonQuery = parse(searchQuery.comparisonQuery);

      _.each(comparisonQuery, (value, key) => {
        searchQuery[key] = value ;
      });

      delete(searchQuery.comparisonQuery);
    }
  
    if (searchQuery.populate) {
      parameters.populate = parse(searchQuery.populate);
    }

    delete(searchQuery.populate);

    if (searchQuery.elemMatch) {

      let elemMatch;

      if (_.isArray(searchQuery.elemMatch)) {
        elemMatch = [];
        _.each(searchQuery.elemMatch, (element) => {
          elemMatch.push(parse(element));
        });
      }
      else {
        elemMatch = parse(searchQuery.elemMatch);
      }

      parameters.elemMatch = elemMatch;
    }

    delete(searchQuery.elemMatch);

    if (searchQuery.exists) {
      searchQuery.exists = parse(searchQuery.exists);

      let exists = [];

      if (_.isArray(searchQuery.exists)) {
        _.each(searchQuery.exists, element => {
          exists.push(parse(element));
        });
      }
      else {
        exists.push(parse(searchQuery.exists));
      }
      
      parameters.exists = exists;
    }

    delete(searchQuery.exists);

    parameters.select = searchQuery.select;
    delete(searchQuery.select);
  
    return parameters;
  }
  
  function parse(element){
    return _.isString(element) ? JSON.parse(element) : element;
  }
  
  function formatSelect(paths, params) {
    let select = params;
  
    if (paths !== 'all') {
      if (!params) {
        select = paths.join(' ');
      }
  
      paths.push('_id');
      
      let selectElements = select.split(' ');
  
      _.each(selectElements, element => {
        let elementParts = element.split('.');
        
        if (elementParts.length && _.contains(paths, elementParts[0])) {
          paths.push(element);
        }
      });
  
      let  unauthorizedPaths = _.difference(selectElements, paths);
  
      if (!_.isEmpty(unauthorizedPaths)) {
        throw _.map(unauthorizedPaths, path => {
          return { message: 'non_authorized_path', value: path };
        });
      }
    }
  
    return select;
  }
  
  function toPlain(element) {
    if (element.toObject) {
      return element.toObject();
    }
  
    return element;
  }

  return {
    create: async (req, res) => {
      try {
        let element = req.body;
        
        let createdItem = await model.create(element);
     
        if (!req.returnInsteadOfResponse) {
          return res.ok(createdItem);
        }

        return createdItem;
      }
      catch (err) {
        console.log(err, '----------error-on-create-core-routes----------');
        res.serverError(err);
      }
    },
    get: async function(req, res) {
      let searchQuery = req.query;
      
      try {
        let parameters = extractParams(searchQuery);

        const paths = await hasPermissions(req.payload.user, searchQuery, 'find');
        parameters.select = formatSelect(paths, parameters.select);

        const elements = await model.find(searchQuery, parameters);

        if (!req.returnInsteadOfResponse) {
          return res.ok(elements);
        }
        
        return elements;
      }
      catch (err) {
        console.log(err, '----------error-on-get-core-routes----------');
        res.serverError(err);
      }
    },
    update: async function(req, res) {
      const filter = req.filter || {};
      
      try {
        let bodyData = req.body;

        const updatedElement = await model.update(bodyData, filter, req.payload);

        if (!req.returnInsteadOfResponse) {
          return res.ok(toPlain(updatedElement));
        }

        return updatedElement;
      }
      catch (err) {
        console.log(err, '----------error-on-update-core-routes----------');
        res.serverError(err);
      }
    },
    remove: async function(req, res) {
      try {
        let removedElement = await model.remove(req.query);

        if (!req.returnInsteadOfResponse) {
          return res.ok(removedElement);
        }
          
        return removedElement;
      }
      catch (err) {
        console.log(err, '----------error-on-remove-core-routes----------');
        res.serverError(err);
      }
    },
    setup: function(operations) {
      var defaults = {create: true, get: true, update: true, remove: true};
      operations = (typeof operations !== 'undefined' ? operations : defaults);

      if (operations.create) {
        router.post(`${path}`, this.create);
      }
      if (operations.get) {
        router.get(`${path}`, this.get);
      }
      if (operations.update) {
        router.put(`${path}`, this.update);
      }
      if (operations.remove) {
        router.delete(`${path}`, this.remove);
      }
    },

    path: path,
    model: model,
    router: router
  };
};

export default prepareRouter;