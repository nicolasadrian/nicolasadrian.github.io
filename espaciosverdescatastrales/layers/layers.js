var baseLayer = new ol.layer.Group({
    'type': 'base',
    'title': 'Base maps',
    layers: [new ol.layer.Tile({
        type: 'base',
        title: 'CartoDB dark',
        source: new ol.source.XYZ({
            url: 'http://s.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            attributions: [new ol.Attribution({
                html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>']
            })]
        })
    })]
});
var lyr_catastro_espacios_verdes_269218 = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(geojson_catastro_espacios_verdes_269218)
    }),

    style: style_catastro_espacios_verdes_269218,
    title: "Catastro_Espacios_Verdes_26092018"
});

lyr_catastro_espacios_verdes_269218.setVisible(true);
var layersList = [baseLayer, lyr_catastro_espacios_verdes_269218];
var singleLayersList = [lyr_catastro_espacios_verdes_269218];
var selectableLayersList = [lyr_catastro_espacios_verdes_269218];