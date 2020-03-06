module.exports.createDocument = (Model, data) => {
  const document = new Model(data);
  return document.save();
};

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