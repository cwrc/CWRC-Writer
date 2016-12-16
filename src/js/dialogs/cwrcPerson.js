//define(['jquery', 'jquery-ui', 'dialogs/cwrcDialogBridge', 'cwrcDialogs'], function($, jqueryUi, cwrcDialogBridge, cD) {
'use strict';

var $ = require('jquery');
require('jquery-ui');
var cwrcDialogBridge = require('./cwrcDialogBridge.js');

function CwrcPerson(writer) {
    var w = writer;

    var schema = null;
    if (w.initialConfig.cwrcDialogs != null && w.initialConfig.cwrcDialogs.schemas != null) {
        schema = w.initialConfig.cwrcDialogs.schemas.person;
    }
    if (schema == null) {
        schema = 'js/cwrcDialogs/schemas/entities.rng';
    }
    cD.setPersonSchema(schema);

    var bridge = new cwrcDialogBridge(w, {
        label: 'Person',
        localDialog: 'person',
        cwrcType: 'person'
    });

    return bridge;
};

module.exports = CwrcPerson;
