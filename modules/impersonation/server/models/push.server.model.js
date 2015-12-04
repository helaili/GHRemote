'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Issue Schema
 */
var PushSchema = new Schema({ payload : Schema.Types.Mixed });

mongoose.model('Push', PushSchema);
