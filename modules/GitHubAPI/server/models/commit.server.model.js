'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Commit Schema
 */
var CommitSchema = new Schema({
  modified : [String],
  removed : [String],
  added : [String],
  committer : {
    username : String,
    email : String,
    name : String
  },
  author : {
    username : String,
    email : String,
    name : String
  },
  url : String,
  timestamp : Date,
  message : String,
  distinct : Boolean,
  spoofed : Boolean,
  id : String,
});

mongoose.model('Commit', CommitSchema);
