var ActivitiRest = {
    options: {},
    getProcessDefinitionByKey: function (processDefinitionKey, callback) {
        var url = Lang.sub(this.options.processDefinitionByKeyUrl, {processDefinitionKey: processDefinitionKey});

        $.ajax({
            url: url,
            dataType: 'jsonp',
            cache: false,
            async: true,
            success: function (data, textStatus) {
                var processDefinition = data;
                if (!processDefinition) {
                    console.error("Process definition '" + processDefinitionKey + "' not found");
                } else {
                    callback.apply({processDefinitionId: processDefinition.id});
                }
            }
        }).done(function (data, textStatus) {
        }).fail(function (jqXHR, textStatus, error) {
            console.error('Get diagram layout[' + processDefinitionKey + '] failure: ', textStatus, 'error: ', error, jqXHR);
        });
    },

    getProcessDefinition: function (processId, callback) {
        var url = Lang.sub(this.options.processDefinitionUrl, {processId: processId});

        $.ajax({
            url: url,
            cache: false,
            async: true,
            success: function (data, textStatus) {
                var processDefinitionDiagramLayout = data.data;
                if (!processDefinitionDiagramLayout) {
                    console.error("Process definition diagram layout '" + processId + "' not found");
                    return;
                } else {
                    callback.apply({processDefinitionDiagramLayout: processDefinitionDiagramLayout});
                }
            }
        }).done(function (data, textStatus) {
        }).fail(function (jqXHR, textStatus, error) {
            console.log('Get diagram layout[' + processId + '] failure: ', textStatus, jqXHR);
        });
    },

    getHighLights: function (instanceId, callback) {

        var url = Lang.sub(this.options.processInstanceHighLightsUrl, {instanceId: instanceId});

        $.ajax({
            url: url,
            cache: false,
            async: true,
            success: function (data, textStatus) {
                var highLights = data.data;
                if (!highLights) {
                    console.log("highLights not found");
                    return;
                } else {

                    callback.apply({highLights: highLights});
                }
            }
        }).done(function (data, textStatus) {
        }).fail(function (jqXHR, textStatus, error) {
            console.log('Get HighLights[' + instanceId + '] failure: ', textStatus, jqXHR);
        });
    }
};