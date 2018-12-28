var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    return false;
};
var overlayPopup = new ol.Overlay({
    element: container
});

var view = new ol.View({
    extent: [-6515731.362647, -4123835.572121, -6494372.586545, -4099715.922287],
    maxZoom: 35,
    minZoom: 1
})

var map = new ol.Map({
    controls: [
        new ol.control.ScaleLine({
            "minWidth": 64,
            "units": "metric"
        })
    ],
    target: document.getElementById('map'),
    renderer: 'canvas',
    overlays: [overlayPopup],
    layers: layersList,
    view: view
});
var originalExtent = [-6515731.362647, -4123835.572121, -6494372.586545, -4099715.922287];
map.getView().fitExtent(originalExtent, map.getSize());

var selectInteraction = new ol.interaction.Select({
    layers: function(layer) {
        return selectableLayersList.indexOf(layer) != -1;
    },
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 100, 50, 0.3)'
        }),
        stroke: new ol.style.Stroke({
            width: 2,
            color: 'rgba(255, 100, 50, 0.8)'
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(255, 100, 50, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                width: 2,
                color: 'rgba(255, 100, 50, 0.8)'
            }),
            radius: 7
        })
    }),
    toggleCondition: ol.events.condition.shiftKeyOnly,
    filter: function(feature, layer) {
        features = f.get("features")
        if (features) {
            return false;
        } else {
            return true
        }
    }
});
map.addInteraction(selectInteraction);

isDuringMultipleSelection = false;

var selectedFeatures = selectInteraction.getFeatures();
selectedFeatures.clear = function() {
    isDuringMultipleSelection = true;
    while (this.getLength() > 1) {
        this.pop();
    }
    isDuringMultipleSelection = false;
    if (this.getLength()) {
        this.pop();
    }
}


var currentInteraction;



var NO_POPUP = 0
var ALL_ATTRIBUTES = 1

popupLayers = [ALL_ATTRIBUTES];

var highlightOverlay = new ol.FeatureOverlay({
    map: map,
    style: [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#f00',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.1)'
        }),
    })]
});

var doHighlight = false;
var doHover = false;

var decluster = function(f) {
    features = f.get("features")
    if (features) {
        if (features.length > 1) {
            return null;
        } else {
            return features[0];
        }
    } else {
        return f;
    }
}

var highlight;
var onPointerMove = function(evt) {
    if (!doHover && !doHighlight) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupField;
    var popupText = '';
    var currentFeature;
    var currentFeatureKeys;
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        feature = decluster(feature);
        if (feature) {
            currentFeature = feature;
            currentFeatureKeys = currentFeature.getKeys();
            var field = popupLayers[singleLayersList.indexOf(layer)];
            if (field == NO_POPUP) {} else if (field == ALL_ATTRIBUTES) {
                for (var i = 0; i < currentFeatureKeys.length; i++) {
                    if (currentFeatureKeys[i] != 'geometry') {
                        popupField = "<b>" + currentFeatureKeys[i] + '</b>: ' + currentFeature.get(currentFeatureKeys[i]);
                        popupText = popupText + popupField + '<br>';
                    }
                }
            } else {
                var value = feature.get(field);
                if (value) {
                    popupText = "<b>" + field + '</b>: ' + value;
                }
            }
        }
    });

    if (doHighlight) {
        if (currentFeature !== highlight) {
            if (highlight) {
                highlightOverlay.removeFeature(highlight);
            }
            if (currentFeature) {
                highlightOverlay.addFeature(currentFeature);
            }
            highlight = currentFeature;
        }
    }

    if (doHover) {
        if (popupText) {
            overlayPopup.setPosition(coord);
            content.innerHTML = popupText;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
            closer.blur();
        }
    }
};

var onSingleClick = function(evt) {
    if (doHover) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupField;
    var popupText = '';
    var currentFeature;
    var currentFeatureKeys;
    var toAdd = [];
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        feature = decluster(feature);
        if (feature) {
            currentFeature = feature;
            currentFeatureKeys = currentFeature.getKeys();
            var field = popupLayers[singleLayersList.indexOf(layer)];
            if (field == NO_POPUP) {} else if (field == ALL_ATTRIBUTES) {
                for (var i = 0; i < currentFeatureKeys.length; i++) {
                    if (currentFeatureKeys[i] != 'geometry') {
                        popupField = "<b>" + currentFeatureKeys[i] + '</b>: ' + currentFeature.get(currentFeatureKeys[i]);
                        popupText = popupText + popupField + '<br>';
                    }
                }
            } else {
                var value = feature.get(field);
                if (value) {
                    popupText = "<b>" + field + '</b>: ' + value;
                }
            }
            if (toAdd.indexOf(feature) == -1) {
                toAdd.push(feature);
            }
        }
    });
    if (currentInteraction == null) {
        selectedFeatures.clear();
        if (toAdd.length !== 0) {
            isDuringMultipleSelection = true;
            selectedFeatures.extend(toAdd.slice(0, -1));
            isDuringMultipleSelection = false;
            selectedFeatures.push(toAdd[toAdd.length - 1]);
        }
    }
    if (popupText) {
        overlayPopup.setPosition(coord);
        content.innerHTML = popupText;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        closer.blur();
    }
};
map.on('pointermove', function(evt) {
    onPointerMove(evt);
});
map.on('singleclick', function(evt) {
    onSingleClick(evt);
});