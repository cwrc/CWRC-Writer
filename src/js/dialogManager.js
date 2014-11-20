define([
    'jquery',
    'jquery-ui',
    'cwrcDialogs',
    'dialogs/addSchema','dialogs/fileManager','dialogs/header','dialogs/message','dialogs/triple',
    'dialogs/cwrcPerson','dialogs/cwrcOrg','dialogs/cwrcPlace','dialogs/cwrcTitle','dialogs/cwrcCitation',
    'dialogs/schemaTags'
], function($, jqueryui, cD,
        AddSchema, FileManager, Header, Message, Triple,
        CwrcPerson, CwrcOrg, CwrcPlace, CwrcTitle, CwrcCitation,
        SchemaTags
) {

// add event listeners to all of our jquery ui dialogs
$.extend($.ui.dialog.prototype.options, {
    create: function(event) {
        $(event.target).on('dialogopen', function(event) {
            // wrap our dialogs in the cwrc css scope
            $(event.target).parent('.ui-dialog').prev('.ui-widget-overlay').andSelf().wrapAll('<div class="cwrc" />');
            // centre the dialog
            $(this).dialog('option', 'position', {my: 'center', at: 'center', of: window});
            // resize if necessary
            var docHeight = $(document).height();
            if ($(this).dialog('option', 'height') >= docHeight) {
                $(this).dialog('option', 'height', docHeight * 0.85);
            }
        }).on('dialogclose', function(event) {
            $(event.target).parent('.ui-dialog').unwrap();
        });
    }
});
// do the same for tooltips
$.extend($.ui.tooltip.prototype.options, {
    create: function(event) {
        $(event.target).on('tooltipopen', function(event, ui) {
            $(ui.tooltip).wrap('<div class="cwrc" />');
        }).on('tooltipclose', function(event, ui) {
            $(ui.tooltip).unwrap();
        });
    }
});

/**
 * @class DialogManager
 * @param {Writer} writer
 */
return function(writer) {
    var w = writer;
    
    var dialogs = {
        message: new Message(w),
        triple: new Triple(w),
        header: new Header(w),
        filemanager: new FileManager(w),
        addschema: new AddSchema(w),
        person: new CwrcPerson(w),
        org: new CwrcOrg(w),
        title: new CwrcTitle(w),
        citation: new CwrcCitation(w),
        place: new CwrcPlace(w),
        schemaTags: new SchemaTags(w)
    };
    
    // log in for CWRC-Dialogs
//    cD.initializeWithCookieData(null);
//    cD.initializeWithLogin('CWRC-WriterTestUser', 'quirkyCWRCwriter');
    
    if (w.initialConfig.cwrcDialogs != null) {
        var conf = w.initialConfig.cwrcDialogs;
        if (conf.cwrcApiUrl != null) cD.setCwrcApi(conf.cwrcApiUrl);
        if (conf.geonameUrl != null) cD.setGeonameUrl(conf.geonameUrl);
        if (conf.viafUrl != null) cD.setViafUrl(conf.viafUrl);
    }
    
    var schemaDialogs = {};
    var dialogNames = ['citation', 'correction', 'date', 'keyword', 'link', 'note', 'org', 'person', 'place', 'title'];
    
    var loadSchemaDialogs = function() {
        var schemaId = w.schemaManager.schemaId;
        var schemaMappingsId = w.schemaManager.getCurrentSchema().schemaMappingsId;
        
        // TODO destroy previously loaded dialogs
        if (schemaDialogs[schemaMappingsId] == null) {
            var parent = schemaDialogs[schemaMappingsId] = {};
            var schemaDialogNames = [];
            schemaDialogNames = $.map(dialogNames, function(name, i) {
                return 'schema/'+schemaMappingsId+'/dialogs/'+name;
            });
            require(schemaDialogNames, function() {
                if (arguments.length != schemaDialogNames.length) {
                    alert('error loading schema dialogs');
                } else {
                    for (var i = 0; i < arguments.length; i++) {
                        var name = dialogNames[i];
                        var id = schemaId+'_'+name+'Form';
                        parent[name] = new arguments[i](id, w);
                    }
                }
            });
        }
    };
    
    w.event('schemaLoaded').subscribe(loadSchemaDialogs);
    
    /**
     * @lends DialogManager.prototype
     */
    var pm = {
        show: function(type, config) {
            if (type.indexOf('schema/') === 0) {
                var typeParts = type.split('/');
                var type = typeParts[1];
                schemaDialogs[w.schemaManager.getCurrentSchema().schemaMappingsId][type].show(config);
            } else {
                if (dialogs[type]) {
                    dialogs[type].show(config);
                } else if (schemaDialogs[w.schemaManager.getCurrentSchema().schemaMappingsId][type]) {
                    schemaDialogs[w.schemaManager.getCurrentSchema().schemaMappingsId][type].show(config);
                }
            }
        },
        confirm: function(config) {
            dialogs.message.confirm(config);
        }
    };
    
    $.extend(pm, dialogs);
    
    return pm;
};

});
