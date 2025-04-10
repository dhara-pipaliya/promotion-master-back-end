"use strict";
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

// find all Industries
Schema.statics.findAll = function () {
  return this.find({}).select("-__v").sort({'name': +1}).lean().exec();
};

// update Industry Details
Schema.statics.updateIndustry = function (data) {
  return this.findOneAndUpdate(
    { _id: data._id },
    { $set: data },
    { new: true }
  );
};

// remove Industry
Schema.statics.delete = function (id) {
  return this.remove({_id: id})
}

const Industry = mongoose.model("Industry", Schema);
module.exports = {
  Industry,
};
