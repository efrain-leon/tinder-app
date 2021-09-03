import Q from 'q';
import _ from 'underscore';
import defaultQuery from './query';
import { serverConfig } from '../../config/server';
import ProcessFiles from './process.files';

const abstractModel = (model, validator, customQuery) => {

  let filePath = `${serverConfig.filePath}/`;

  const populate = function(query) {
    return query;
  };

  let resultModel = {};

  const find = async (filters, parameters) => {
    try {
      parameters = parameters || {};

      let action = 'find';
      if (parameters.count) {
        action = 'count';
      }

      let mongooseQuery = model[action](filters);
      let query;

      if (customQuery) {
        query = customQuery(mongooseQuery);
      }
      else{
        query = defaultQuery(mongooseQuery);
      }

      query.sort(parameters.sort);
      query.or(parameters.or);
      query.lean(parameters.lean);
      query.populate(parameters.populate, resultModel.populate);
      query.elemMatch(parameters.elemMatch);
      query.exists(parameters.exists);

      if (action === 'find') {
        query.select(parameters.select);
      }
      
      query.paginate(parameters.page, parameters.per_page);

      if (!parameters.globalSearch) {
        query.globalSearch = function() { 
          return Q({});
        };
      }

      const searchFilters = await query.globalSearch(parameters.globalSearch, filters, parameters);
      mongooseQuery[action](searchFilters);
      const elements = await mongooseQuery.exec();

      return elements;
    }
    catch (err) {
      throw err;
    }
  };

  const create = async (data) => {
    try {
      const validatedData = await validator.validate(data);
      await ProcessFiles(filePath).saveImages(model.schema, validatedData);
    
      const savedData = await saveData(validatedData);
      return savedData;
    }
    catch (err) {
      throw processDBError(err);
    }
  };

  const update = async function(changes, filterConditions) {
    try {
      if (changes.companyPrivateName) {
        filePath = `${serverConfig.filePath}/${changes.companyPrivateName}`;
      }
      
      let validatedChanges = await validator.validate(changes);
      await ProcessFiles(filePath).saveImages(model.schema, validatedChanges);
      await ProcessFiles(filePath).saveFiles(model.schema, validatedChanges);

      const updatedData = await updateData(validatedChanges, filterConditions);
      return updatedData;
    }
    catch (err) {
      console.log(err, 'err on update core model');
      throw err;
    }
  };

  const remove = async (query) => {
    try {
      const removedData = await model.findByIdAndRemove(query._id);
      
      if (removedData) {
        return removedData;
      }

      throw { message: 'element_not_found', value: query._id };
    }
    catch (err) {
      throw(err);
    };
  };

  async function saveData(data) {
    try {
      const newData = new model(data);
      const savedData = await newData.save();
      return savedData;
    }
    catch (err) {
      throw processDBError(err);
    }
  }

  async function updateData(changes, filterConditions) {
    try {
      const options = {new: true};

      let conditions = filterConditions || {};
      conditions._id = changes._id;

      changes = sanitizeChanges(changes);
      
      const updatedElement = await model.findOneAndUpdate(conditions, changes, options);

      if (updatedElement === null) {
        throw {message: 'element_not_found', value: conditions._id};
      }
      
      return updatedElement;
    }
    catch (err) {
      throw processDBError(err);
    }
  }

  function sanitizeChanges(changes) {
    if (changes.toObject !== undefined) {
      changes = changes.toObject();
    }
    delete changes._id;
    return changes;
  }

  function processDBError(error) {
    if (error.name === 'MongoError') {
      let localError = (error.lastErrorObject)? error.lastErrorObject : error;

      if (localError.code === 11000 || localError.code === 11001) {
        return composeDuplicateFieldError(localError);
      }
      return { message: localError.err };
    }

    if (error.name === 'CastError') {
      let message = error.name + ' - ' + error.type;
      return { message: message, value: error.value };
    }
    
    return error;
  }

  function composeDuplicateFieldError(error) {
    const regex = /"([^"]*)"/;
    let result = (error.err) ? error.err.match(regex) : error.errmsg.match(regex);
    let index;
    let value;

    if (result === null) {
      value = error.err;
    }

    if (result) {
      index = (error.err) ? error.err.match(/(\$.*?)\s/)? error.err.match(/(\$.*?)\s/)[1] : 0 : error.errmsg.match(/(\$.*?)\s/)? error.errmsg.match(/(\$.*?)\s/)[1] : 0;
      value = result[1];
    }

    return {message: 'Duplicate field', value: value, index: index};
  }

  resultModel = {
    find: find,

    findById: async (id, parameters) => {
      try {
        const elements = await find.call(this, {_id: id}, parameters);
        return _.isEmpty(elements)? null : elements[0];
      }
      catch (err) {
        throw err;
      }
    },
    findOne: async (filters, parameters) => {
      try {
        const elements = await find.call(this, filters, parameters);
        return _.isEmpty(elements)? null : elements[0];
      }
      catch (err) {
        throw err;
      }
    },

    create: create,
    update: update,
    remove: remove,
    validator: validator,
    schema: model.schema,
    populate: populate
  };

  return resultModel;
};

export default abstractModel;