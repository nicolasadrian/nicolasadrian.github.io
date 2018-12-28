var textStyleCache_catastro_espacios_verdes_269218 = {}
var clusterStyleCache_catastro_espacios_verdes_269218 = {}
var style_catastro_espacios_verdes_269218 = function(feature, resolution) {

    var value = ""
    var style = [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: "rgba(128,152,72,1.0)",
            lineDash: null,
            width: 0
        }),
        fill: new ol.style.Fill({
            color: "rgba(186,221,105,1.0)"
        })
    }), new ol.style.Style({

    })];
    var labelText = "";
    var key = value + "_" + labelText

    if (!textStyleCache_catastro_espacios_verdes_269218[key]) {
        var text = new ol.style.Text({
            font: '16.5px Calibri,sans-serif',
            text: labelText,
            fill: new ol.style.Fill({
                color: "rgba(0, 0, 0, 255)"
            }),
        });
        textStyleCache_catastro_espacios_verdes_269218[key] = new ol.style.Style({
            "text": text
        });
    }
    var allStyles = [textStyleCache_catastro_espacios_verdes_269218[key]];
    allStyles.push.apply(allStyles, style);
    return allStyles;
};