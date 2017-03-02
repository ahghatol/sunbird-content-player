var TextPlugin = Plugin.extend({
    _type: 'text',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var instance = this;
        var fontsize = data.fontsize || 20;
        var dims = this.relativeDims();
        //var fontFace = (data.font || 'Arial');
        if(!(_.isUndefined(data.font)) && (data.font.toLowerCase() == "verdana" || data.font.toLowerCase() == "notosans oriya")) {
           // By default template creators are adding font as "Verdana" for template.
           // This is causing font rendering issue for other languages(tamil, bengali etc..)
           // This is fallback to support old published contents. Informed template creators not to specify any font for text element in templates
           data.font = undefined;
        }
        var fontFace = (data.font || this.getDefaultFont());
        var lineHeight = (data.lineHeight ? data.lineHeight : 0);
        var outline = (data.outline ? data.outline : 0);

        // Resize if the font size is a number
        if (isFinite(fontsize)) {
            if (data.w) {
                var exp = parseFloat(PluginManager.defaultResWidth * data.w / 100);
                var cw = this._parent.dimensions().w;
                var width = parseFloat(cw * data.w / 100);
                var scale = parseFloat(width / exp);
                fontsize = parseFloat(fontsize * scale);
                fontsize = fontsize + 'px';
            }
        }

        // If font size is in "em", "%" or "px", no resizing will be done
        var font = fontsize + " " + fontFace;

        if (data.weight) {
            font = data.weight + ' ' + font;
        }

        // Value of the text
        var textStr = '';
        if (data.$t || data.__text) {
            textStr = (data.$t || data.__text);
        } else if (data.model) {
            textStr = (this._stage.getModelValue(data.model) || '');
        } else if (data.param) {
            textStr = (this.getParam(data.param.trim()) || '');
        }

        // Init text object
        var text = new createjs.Text(textStr, font, data.color || '#000000');
        text.lineWidth = dims.w;
        text.x = dims.x;
        text.y = dims.y;
        text.lineHeight = lineHeight * (text.getMeasuredLineHeight());
        text.outline = outline;

        // H and V alignment
        var align  = (data.align ? data.align.toLowerCase() : 'left');
        var valign = (data.valign ? data.valign.toLowerCase() : 'top');

        if (align == 'left') {
            text.x = dims.x;
        } else if (align == 'right') {
            text.x = dims.x + dims.w;
        } else if (align == 'center') {
            text.x = dims.x + dims.w/2;
        }

        if (valign == 'top') {
            text.y = dims.y;
            text.textBaseline = 'hanging';
        } else if (valign == 'bottom') {
            text.y = dims.y + dims.h - text.getMeasuredHeight();
            text.textBaseline = 'hanging';
        } else if (valign == 'middle') {
            text.y = dims.y + dims.h/2 - text.getMeasuredHeight()/2;
            if (data.textBaseline) {
                text.textBaseline = 'top'; 
            } else {
                text.textBaseline = 'hanging';                
            }
        }
 
        if (data.textBaseline) {
             text.textBaseline = data.textBaseline; 
        }

        text.textAlign = align;
        text.valign = valign;
        this._self = text;
        if (data.rotate) {
            this.rotation(data, dims);
        }
    },
    refresh: function() {
        var instance = this;
        var textStr = '';
        if (instance._data.$t || instance._data.__text) {
            textStr = (instance._data.$t || instance._data.__text);
        } else if (instance._data.model) {
            textStr = (this._stage.getModelValue(instance._data.model) || '');
        } else if (instance._data.param) {
            textStr = (this.getParam(instance._data.param.trim()) || '');
        }
        if (textStr && textStr != '') {
            this._self.text = textStr;
            Renderer.update = true;
        }
    }
});
PluginManager.registerPlugin('text', TextPlugin);
