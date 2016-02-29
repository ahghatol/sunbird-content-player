var SetPlugin = Plugin.extend({
    _type: 'set',
    _isContainer: false,
    _modelName: undefined,
    _model: undefined,
    _index: 0,
    initPlugin: function(data) {
        this._modelName = undefined;
        this._model = undefined;
        this._index = 0;
        var value = data.value;
        if (data['ev-value']) {
            value = this.evaluateExpr(data['ev-value']);
        } else if (data['model']) {
            if (this._stage) {
                value = this._stage.getModelValue(data['model']);
            }
        } else if (data['controller']) {
            if (this._stage) {
                var model = this.replaceExpressions(data['controller']);
                this._modelName = data.param;
                this._model = this._stage.getModelValue(model);
                if (_.isArray(this._model)) {
                    value = this._model[0];
                } else {
                    value = this._model;
                }
            }
        }
        this.setParam(data.param, value, undefined, data.scope);
    },
    replaceExpressions: function(model) {
        var arr = [];
        var idx = 0;
        var nextIdx = model.indexOf('${', idx);
        var endIdx = model.indexOf('}', idx + 1);
        while (nextIdx != -1 && endIdx != -1) {
            var expr = model.substring(nextIdx, endIdx+1);
            arr.push(expr);
            idx = endIdx;
            nextIdx = model.indexOf('${', idx);
            endIdx = model.indexOf('}', idx + 1);
        }
        if (arr.length > 0) {
            for (var i=0; i<arr.length; i++) {
                var val = this.evaluateExpr(arr[i]);
                model = model.replace(arr[i], val);
            }
        }
        return model;
    },
    setParamValue: function(action) {
        var scope = action.scope;
        var param = action.param;
        var paramIdx = action['param-index'];
        var paramKey = action['param-key'];
        var val;
        if (paramIdx) {
            if (paramIdx == 'previous') {
                if (_.isArray(this._model) && this._model.length > 0) {
                    if (this._index > 0) {
                        this._index = (this._index - 1);
                    } else {
                        this._index = (this._model.length - 1);
                    }
                    val = this._model[this._index];
                } else {
                    val = this._model;
                }
            } else {
                if (_.isArray(this._model)) {
                    if (this._index < this._model.length - 1) {
                        this._index = (this._index + 1);
                    } else {
                        this._index = 0;
                    }
                    val = this._model[this._index];
                } else {
                    val = this._model;
                }
            }
        } else if (paramKey) {
            if (_.isObject(this._model) && this.model[paramKey]) {
                val = this.model[paramKey];
            } else {
                val = '';
            }
        } else {
            val = action['param-value'];
        }
        this.setParam(param, val, action['param-increment'], scope);
    },
    setParam: function(param, value, incr, scope) {
        if (scope && scope.toLowerCase() == 'app') {
            GlobalContext.setParam(param, value, incr);
        } else if (scope && scope.toLowerCase() == 'stage') {
            this._stage.setParam(param, value, incr);
        } else {
            this._theme.setParam(param, value, incr);
        }
    },
    getParam: function(param) {
        var value = GlobalContext.getParam(param);
        if (!value) value = this._theme.getParam(param);
        if (!value) value = this._stage.getParam(param);
        return value;
    }
});
PluginManager.registerPlugin('set', SetPlugin);
