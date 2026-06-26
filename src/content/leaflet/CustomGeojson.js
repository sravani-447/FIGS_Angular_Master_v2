//var layerGlobalGeojson;
function CreateAndLoadGeoJsonLayer(data, popupFields="NA") {
    let fldArray = [];
    if (popupFields !="NA") {
        Object.keys(popupFields).forEach(function (key, index) {
            fldArray.push(key);
            // index: the ordinal position of the key within the object 
        });
    }

    var layerGlobalGeojson = null;
    if (data.length > 0) {
        var featureCollection = [];
        data.forEach(element => {
            var feature = {
                "type": "Feature",
                "properties": element,
                "geometry": {
                    "coordinates": [
                        element.lng,
                        element.lat
                    ],
                    "type": "Point"
                }
            };
            featureCollection.push(feature);
        });


        var newGeojson = { "type": "FeatureCollection", "features": featureCollection };
        var layerGlobalGeojson =L.geoJSON(newGeojson, {
            onEachFeature: function (feature, layer) {
                var popupContent = "<p><strong>Attributes:</strong></p>";
                if (popupFields != "NA") {
                    for (var key in feature.properties) {
                        if (fldArray.indexOf(key)>-1)
                                popupContent += "<p>" + key + ": " + feature.properties[key] + "</p>";
                    }

                }
                else {

                    for (var key in feature.properties) {
                        popupContent += "<p>" + key + ": " + feature.properties[key] + "</p>";
                    }
                }
                layer.bindPopup(popupContent);
            },
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 8,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            }
        });

        map.addLayer(layerGlobalGeojson);
        map.fitBounds(layerGlobalGeojson.getBounds());
        return layerGlobalGeojson;
    }

}