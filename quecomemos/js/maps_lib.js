(function (window, undefined) {
    var MapsLib = function (options) {
        var self = this;

        options = options || {};

        this.recordName = options.recordName || "registro"; //for showing a count of results
        this.recordNamePlural = options.recordNamePlural || "registros";
        this.searchRadius = options.searchRadius || 805; //in meters ~ 1/2 mile

        // the encrypted Table ID of your Fusion Table (found under File => About)
        this.fusionTableId = options.fusionTableId || "10c6Ok19Ik1TVMUKzzUb774C1vo-glFIZPSyPn_Bs",

        // Found at https://console.developers.google.com/
        // Important! this key is for demonstration purposes. please register your own.
        this.googleApiKey = options.googleApiKey || "AIzaSyCirQVWeLi8N5pqqAGJpCMFWjP_n4UpqNU",
        
        // name of the location column in your Fusion Table.
        // NOTE: if your location column name has spaces in it, surround it with single quotes
        // example: locationColumn:     "'my location'",
        this.locationColumn = options.locationColumn || "col2";
        
        // appends to all address searches if not present
        this.locationScope = options.locationScope || "";

        // zoom level when map is loaded (bigger is more zoomed in)
        this.defaultZoom = options.defaultZoom || 11; 

        // center that your map defaults to
        this.map_centroid = new google.maps.LatLng(options.map_center[0], options.map_center[1]);
        
        // marker image for your searched address
        if (typeof options.addrMarkerImage !== 'undefined') {
            if (options.addrMarkerImage != "")
                this.addrMarkerImage = options.addrMarkerImage;
            else
                this.addrMarkerImage = ""
        }
        else
            this.addrMarkerImage = "images/blue-pushpin.png"

    	this.currentPinpoint = null;
    	$("#result_count").html("");
        
        this.myOptions = {
            zoom: this.defaultZoom,
            center: this.map_centroid,
            
			//mapTypeId: google.maps.MapTypeId.ROADMAP
         // How you would like to style the map. 
                    // This is where you would paste any style found on Snazzy Maps.
                    styles: [{"featureType":"all","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"gamma":0.01},{"lightness":20}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"saturation":-31},{"lightness":-33},{"weight":2},{"gamma":0.8}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#050505"}]},{"featureType":"administrative.locality","elementType":"labels.text.stroke","stylers":[{"color":"#fef3f3"},{"weight":"3.01"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#0a0a0a"},{"visibility":"off"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.stroke","stylers":[{"color":"#fffbfb"},{"weight":"3.01"},{"visibility":"off"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":30},{"saturation":30}]},{"featureType":"poi","elementType":"geometry","stylers":[{"saturation":20}]},{"featureType":"poi.attraction","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"lightness":20},{"saturation":-20}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":10},{"saturation":-30}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"saturation":25},{"lightness":25}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#a1a1a1"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#292929"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#202020"}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"simplified"},{"hue":"#0006ff"},{"saturation":"-100"},{"lightness":"13"},{"gamma":"0.00"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#686868"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"visibility":"off"},{"color":"#8d8d8d"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#353535"},{"lightness":"6"}]},{"featureType":"road.arterial","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"weight":"3.45"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#d0d0d0"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"lightness":"2"},{"visibility":"on"},{"color":"#999898"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#383838"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"color":"#faf8f8"}]},{"featureType":"water","elementType":"all","stylers":[{"lightness":-20}]}]
                };
		};
        this.geocoder = new google.maps.Geocoder();
        this.map = new google.maps.Map($("#map")[0], this.myOptions);
        
        // maintains map centerpoint for responsive design
        google.maps.event.addDomListener(self.map, 'idle', function () {
            self.calculateCenter();
        });
        google.maps.event.addDomListener(window, 'resize', function () {
            self.map.setCenter(self.map_centroid);
        });
        self.searchrecords = null;

        //reset filters
        $("#search_address").val(self.convertToPlainString($.address.parameter('address')));
		 $("#text_search").val(self.convertToPlainString($.address.parameter('text_search'))); //se agrega esta linea para que limpie el registro de busqueda cada vez que se agregue un box de busqueda por texto
		 $("#text_search1").val(self.convertToPlainString($.address.parameter('text_search1'))); //se agrega esta linea para que limpie el registro de busqueda cada vez que se agregue un box de busqueda por texto 
		 $("#text_search2").val(self.convertToPlainString($.address.parameter('text_search2'))); //se agrega esta linea para que limpie el registro de busqueda cada vez que se agregue un box de busqueda por texto
		
        var loadRadius = self.convertToPlainString($.address.parameter('radius'));
        if (loadRadius != "") 
            $("#search_radius").val(loadRadius);
        else 
            $("#search_radius").val(self.searchRadius);
        
        $(":checkbox").prop("checked", "checked");
        $("#result_box").hide();

        //-----custom initializers-----
	/*	//nuevo que se agrega
		$("#age-slider").slider({
    orientation: "horizontal",
    range: true,
    min: 2009,
    max: 2016,
    values: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
    step: 0,
    slide: function (event, ui) {
        $("#age-selected-start").html(ui.values[0]);
      $("#age-selected-end").html(ui.values[1]);
    },
    stop: function(event, ui) {
      self.doSearch();
    }
});//cierre de nuevo que se agrega  */
	


        //-----end of custom initializers-----

        //run the default search when page loads
        self.doSearch();
        if (options.callback) options.callback(self);
    };

    //-----custom functions-----
    //-----end of custom functions-----

    MapsLib.prototype.submitSearch = function (whereClause, map) {
        var self = this;
        //get using all filters
        //NOTE: styleId and templateId are recently added attributes to load custom marker styles and info windows
        //you can find your Ids inside the link generated by the 'Publish' option in Fusion Tables
        //for more details, see https://developers.google.com/fusiontables/docs/v1/using#WorkingStyles
        self.searchrecords = new google.maps.FusionTablesLayer({
            query: {
                from: self.fusionTableId,
                select: self.locationColumn,
                where: whereClause
            },
            styleId: 2,
            templateId: 2
        });
        self.fusionTable = self.searchrecords;
        self.searchrecords.setMap(map);
        self.getCount(whereClause);
    };


    MapsLib.prototype.getgeoCondition = function (address, callback) {
        var self = this;
        if (address !== "") {
            if (address.toLowerCase().indexOf(self.locationScope) === -1) {
                address = address + " " + self.locationScope;
            }
            self.geocoder.geocode({
                'address': address
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    self.currentPinpoint = results[0].geometry.location;
                    var map = self.map;

                    $.address.parameter('address', encodeURIComponent(address));
                    $.address.parameter('radius', encodeURIComponent(self.searchRadius));
                    map.setCenter(self.currentPinpoint);
                    // set zoom level based on search radius
                    if (self.searchRadius >= 1610000) map.setZoom(4); // 1,000 miles
                    else if (self.searchRadius >= 805000) map.setZoom(5); // 500 miles
                    else if (self.searchRadius >= 402500) map.setZoom(6); // 250 miles
                    else if (self.searchRadius >= 161000) map.setZoom(7); // 100 miles
                    else if (self.searchRadius >= 80500) map.setZoom(8); // 100 miles
                    else if (self.searchRadius >= 40250) map.setZoom(9); // 100 miles
                    else if (self.searchRadius >= 16100) map.setZoom(11); // 10 miles
                    else if (self.searchRadius >= 8050) map.setZoom(12); // 5 miles
                    else if (self.searchRadius >= 3220) map.setZoom(13); // 2 miles
                    else if (self.searchRadius >= 1610) map.setZoom(14); // 1 mile
                    else if (self.searchRadius >= 805) map.setZoom(15); // 1/2 mile
                    else if (self.searchRadius >= 400) map.setZoom(16); // 1/4 mile
                    else self.map.setZoom(17);

                    if (self.addrMarkerImage != '') {
                        self.addrMarker = new google.maps.Marker({
                            position: self.currentPinpoint,
                            map: self.map,
                            icon: self.addrMarkerImage,
                            animation: google.maps.Animation.DROP,
                            title: address
                        });
                    }
                    var geoCondition = " AND ST_INTERSECTS(" + self.locationColumn + ", CIRCLE(LATLNG" + self.currentPinpoint.toString() + "," + self.searchRadius + "))";
                    callback(geoCondition);
                    self.drawSearchRadiusCircle(self.currentPinpoint);
                } else {
                    alert("Su resultado de busqueda da: " + status);
                    callback('');
                }
            });
        } else {
            callback('');
        }
    };

    MapsLib.prototype.doSearch = function () {
        var self = this;
        self.clearSearch();
        var address = $("#search_address").val();
        self.searchRadius = $("#search_radius").val();
        self.whereClause = self.locationColumn + " not equal to ''";
        
        //-----custom filters-----
	/*	if ( $("#select_type").val() != "")
        self.whereClause += " AND 'type' = '" + $("#select_type").val() + "'";*/
	/*  self.whereClause += " AND 'col13' >= '" + $("#age-selected-start").html() + "'";
self.whereClause += " AND 'col13' <= '" + $("#age-selected-end").html() + "'";
*/
	  var text_search = $("#text_search").val().replace("'", "\\'");
if (text_search != '')
  self.whereClause += " AND 'col1' contains ignoring case '" + text_search + "'";
	  
	  var text_search1 = $("#text_search1").val().replace("'", "\\'");
if (text_search1 != '')
  self.whereClause += " AND 'col5' contains ignoring case '" + text_search1 + "'";
	   
	   var text_search2 = $("#text_search2").val().replace("'", "\\'");
if (text_search2 != '')
  self.whereClause += " AND 'col3' contains ignoring case '" + text_search2 + "'";
	  
	   
	   
	  
	  
        //-----end of custom filters-----

        self.getgeoCondition(address, function (geoCondition) {
            self.whereClause += geoCondition;
            self.submitSearch(self.whereClause, self.map);
        });

    };

    MapsLib.prototype.reset = function () {
        $.address.parameter('address','');
        $.address.parameter('radius','');
		
        window.location.reload();
    };


    MapsLib.prototype.getInfo = function (callback) {
        var self = this;
        jQuery.ajax({
            url: 'https://www.googleapis.com/fusiontables/v1/tables/' + self.fusionTableId + '?key=' + self.googleApiKey,
            dataType: 'json'
        }).done(function (response) {
            if (callback) callback(response);
        });
    };

    MapsLib.prototype.addrFromLatLng = function (latLngPoint) {
        var self = this;
        self.geocoder.geocode({
            'latLng': latLngPoint
        }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    $('#search_address').val(results[1].formatted_address);
                    $('.hint').focus();
                    self.doSearch();
                }
            } else {
                alert("Geocoder failed due to: " + status);
            }
        });
    };

    MapsLib.prototype.drawSearchRadiusCircle = function (point) {
        var self = this;
        var circleOptions = {
            strokeColor: "#4b58a6",
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: "#ffd306",
            fillOpacity: 0.05,
            map: self.map,
            center: point,
            clickable: false,
            zIndex: -1,
            radius: parseInt(self.searchRadius)
        };
        self.searchRadiusCircle = new google.maps.Circle(circleOptions);
    };

    MapsLib.prototype.query = function (query_opts, callback) {
        var queryStr = [],
            self = this;
        queryStr.push("SELECT " + query_opts.select);
        queryStr.push(" FROM " + self.fusionTableId);
        // where, group and order clauses are optional
        if (query_opts.where && query_opts.where != "") {
            queryStr.push(" WHERE " + query_opts.where);
        }
        if (query_opts.groupBy && query_opts.groupBy != "") {
            queryStr.push(" GROUP BY " + query_opts.groupBy);
        }
        if (query_opts.orderBy && query_opts.orderBy != "") {
            queryStr.push(" ORDER BY " + query_opts.orderBy);
        }
        if (query_opts.offset && query_opts.offset !== "") {
            queryStr.push(" OFFSET " + query_opts.offset);
        }
        if (query_opts.limit && query_opts.limit !== "") {
            queryStr.push(" LIMIT " + query_opts.limit);
        }
        var theurl = {
            base: "https://www.googleapis.com/fusiontables/v1/query?sql=",
            queryStr: queryStr,
            key: self.googleApiKey
        };
        $.ajax({
            url: [theurl.base, encodeURIComponent(theurl.queryStr.join(" ")), "&key=", theurl.key].join(''),
            dataType: "json"
        }).done(function (response) {
            //console.log(response);
            if (callback) callback(response);
        }).fail(function(response) {
            self.handleError(response);
        });
    };

    MapsLib.prototype.handleError = function (json) {
        if (json.error !== undefined) {
            var error = json.responseJSON.error.errors;
            console.log("Error in Fusion Table call!");
            for (var row in error) {
                console.log(" Domain: " + error[row].domain);
                console.log(" Reason: " + error[row].reason);
                console.log(" Message: " + error[row].message);
            }
        }
    };
    MapsLib.prototype.getCount = function (whereClause) {
        var self = this;
        var selectColumns = "Count()";
        self.query({
            select: selectColumns,
            where: whereClause
        }, function (json) {
            self.displaySearchCount(json);
        });
    };

    MapsLib.prototype.displaySearchCount = function (json) {
        var self = this;
        
        var numRows = 0;
        if (json["rows"] != null) {
            numRows = json["rows"][0];
        }
        var name = self.recordNamePlural;
        if (numRows == 1) {
            name = self.recordName;
        }
        $("#result_box").fadeOut(function () {
            $("#result_count").html(self.addCommas(numRows) + " " + name + " encontrados");
        });
        $("#result_box").fadeIn();
    };

    MapsLib.prototype.addCommas = function (nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    };

    // maintains map centerpoint for responsive design
    MapsLib.prototype.calculateCenter = function () {
        var self = this;
        center = self.map.getCenter();
    };

    //converts a slug or query string in to readable text
    MapsLib.prototype.convertToPlainString = function (text) {
        if (text === undefined) return '';
        return decodeURIComponent(text);
    };

    MapsLib.prototype.clearSearch = function () {
        var self = this;
        if (self.searchrecords && self.searchrecords.getMap) 
            self.searchrecords.setMap(null);
        if (self.addrMarker && self.addrMarker.getMap) 
            self.addrMarker.setMap(null);
        if (self.searchRadiusCircle && self.searchRadiusCircle.getMap) 
            self.searchRadiusCircle.setMap(null);
    };

    MapsLib.prototype.findMe = function () {
        var self = this;
        var foundLocation;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                var accuracy = position.coords.accuracy;
                var coords = new google.maps.LatLng(latitude, longitude);
                self.map.panTo(coords);
                self.addrFromLatLng(coords);
                self.map.setZoom(14);
                jQuery('#map').append('<div id="myposition"><i class="fontello-target"></i></div>');
                setTimeout(function () {
                    jQuery('#myposition').remove();
                }, 3000);
            }, function error(msg) {
                alert('Please enable your GPS position future.');
            }, {
                //maximumAge: 600000,
                //timeout: 5000,
                enableHighAccuracy: true
            });
        } else {
            alert("Geolocation API is not supported in your browser.");
        }
    };
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = MapsLib;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return MapsLib;
        });
    } else {
        window.MapsLib = MapsLib;
    }

})(window);