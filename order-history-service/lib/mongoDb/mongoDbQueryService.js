function isDuplicateKeyError(err) {
  return err.code === 11000;
}

module.exports.updateDocument = (Model, data, conditions) => {
  const update = {};

  if (data['$unset'] && typeof (data['$unset']) === 'object') {
    update['$unset'] = data['$unset'];
    delete data['$unset'];
  }

  update['$set'] = data;

  const options = { multi: false };

  return Model.update(conditions, update, options);
};

module.exports.createDocument = async (Model, data) => {
  const document = new Model(data);
  try {
    return await document.save();
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      try {
        return await module.exports.updateDocument(Model, data, { id: data.id })
      } catch (e) {
        throw e;
      }
    }

    throw err;
  }
};

module.exports.findDocument = (schema, condition = {}) => {
  return new Promise((resolve, reject) => {
    schema.find(condition, { _id: 0, __v: 0  }, { sort: { id: 1 }}, (err, res) => {
      if (err) {
        return reject(err);
      }

      resolve(res);
    });
  });
};

module.exports.documentsCount = (schema, condition = {}) => {
  return new Promise((resolve, reject) => {
    schema.countDocuments(condition, (err, res) => {
      if (err) {
        return reject(err);
      }

      resolve(res);
    });
  });
};
