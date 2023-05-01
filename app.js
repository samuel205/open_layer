window.onload = inicio;


function inicio(){
	var vistaOSM = new ol.View({
        center:[-79.593203,-2.129255],// longitud, latitud
        zoom:8,
        projection:'EPSG:4326'//Datum: WGS84 Geográficas:4326
    });
	var basemapBlanco = new ol.layer.Tile({
		title: 'Blanco',
		type: 'base',
		visible: false
	});      
    
	var basemapOSM = new ol.layer.Tile({
		title: 'Open Street Map',
		visible: true,
		type: 'base',
		source: new ol.source.OSM()
	});

    var basemapGoogleSatelite = new ol.layer.Tile({
		title:'Google Satellite',
		type:'base',
		visible:false,
		source: new ol.source.XYZ({
			url: "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
			})
	});

	var basemapGoogle = new ol.layer.Tile({
		title:'Google Callejero',
		type:'base',
		visible:false,
		source: new ol.source.XYZ({
			url: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"
			})
	});

	var basemapBing = new ol.layer.Tile({
		title:'Bing Map',
		type:'base',
		visible:false,
		source: new ol.source.BingMaps({
			key:'Anzbo5_U1A0SuxVZpc8rqUBSRLsHmJ1ZgCGzhYnxXKpkpm9k3SuyK7OgitBhBPUs',
			imagerySet:'Aerial'
			})
	});	
	
	var baseGroup = new ol.layer.Group({
		title: 'Base maps',
		fold: true,
		layers: [basemapBing,basemapGoogle, basemapGoogleSatelite, basemapOSM, basemapBlanco]
	});

	var estiloguayas = function(feature) {
		const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16); // Genera un color aleatorio en formato hexadecimal
		const style = new ol.style.Style({
		  fill: new ol.style.Fill({
			color: randomColor + '50' // Establece el color de relleno con una transparencia del 20%
		  }),
		  stroke: new ol.style.Stroke({
			color: randomColor + 'FF', // Establece el color de borde con una opacidad del 100%
			width: 2 // Establece el ancho del borde en píxeles
		  })
		});
		var usomanzanageojson = feature.get('DPA_DESCAN')

        var txtUso = new ol.style.Style({
            text: new ol.style.Text({
                font:'bold 6px arial',
                text: usomanzanageojson,
                scale: 1.5,
                fill: new ol.style.Fill({
                    color:[0,0,0,1]
                })
            })
        });
		feature.setStyle([txtUso,style]);
		return style;
	  }

	  var estilomilagro = function(feature) {
		const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16); // Genera un color aleatorio en formato hexadecimal
		const style = new ol.style.Style({
		  fill: new ol.style.Fill({
			color: [255,144,144,1] // Establece el color de relleno con una transparencia del 20%
		  }),
		  stroke: new ol.style.Stroke({
			color: randomColor + 'FF', // Establece el color de borde con una opacidad del 100%
			width: 2 // Establece el ancho del borde en píxeles
		  })
		});

		
		var name_can = feature.get('DPA_DESCAN')
		var textCn = new ol.style.Style({ 
			text: new ol.style.Text({
				font:'bold 6px arial',
				text: name_can,
				scale: 1.5,
				fill: new ol.style.Fill({
					color:[0,0,0,1]
				})
			})
		});
		feature.setStyle([textCn,style]);
		return style;
	  }

	var jsonCantones = new ol.layer.Vector({
        source: new ol.source.Vector({
            url:'data/guayas.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible:true,
        title:'Cantones',
        style:estiloguayas
    });

	var ciudadMilagro = new ol.layer.Vector({
        source: new ol.source.Vector({
            url:'data/milagro.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible:false,
        title:'Milagro',
        style: estilomilagro
    });
	console.log(jsonCantones)

	var puntosgeojson = new ol.layer.Vector({
        source: new ol.source.Vector({
            url:'data/poblados_milagro.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible:false,
        title:'Poblados',
        style: new ol.style.Style({
			image: new ol.style.Circle({
				radius: 5,
				fill: new ol.style.Fill({color: [255,0,0,255]}),
				stroke: new ol.style.Stroke({color: 'black', width: 2})
			  })
		})
    });

	const map = new ol.Map({
        view: vistaOSM,
        //layers:[ciudadMilagro,puntosgeojson],
        target:"mapa"
    });
	var overlayGroup = new ol.layer.Group({
		title: 'Capas Operacionales',
		fold: true,
		layers:[ciudadMilagro,puntosgeojson,jsonCantones],
	});
	
	map.addLayer(baseGroup);
	map.addLayer(overlayGroup);
	var pantallaCompleta = new ol.control.FullScreen();
    map.addControl(pantallaCompleta);
	var barraEscala = new ol.control.ScaleLine({
        bar:true,
        text:true
    });
    map.addControl(barraEscala);

    var overviewMap = new ol.control.OverviewMap({
        layers:[
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        collapsed:true
    });
    map.addControl(overviewMap);
	var mostrarCoordenadas = new ol.control.MousePosition({
        projection:'EPSG:4326',
        coordinateFormat: function(coordenada){
            return ol.coordinate.format(coordenada, '{y}, {x}', 6)
        }
    });
    map.addControl(mostrarCoordenadas);
	var controlCapas=new ol.control.LayerSwitcher({
        activationMode: 'click',
		startActive: false,
		groupSelectStyle: 'children' // Can be 'children' [default], 'group' or 'none'
    });
    map.addControl(controlCapas);
	var container = document.getElementById('popup');
	var contenido = document.getElementById('popup-content');
	var titlos = document.getElementById('popup-title');
	var cerrar = document.getElementById('popup-closer');
	
	var popup = new ol.Overlay({
		element: container,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		},
	});

	map.addOverlay(popup);

	cerrar.onclick = function () {
		popup.setPosition(undefined);
		cerrar.blur();
		return false;
	};

	map.on('singleclick', function (e) {
		popup.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel, (feature,layer) => {
            var name_prov = feature.get('DPA_DESPRO');
            var name_can = feature.get('DPA_DESCAN');
            var anio = feature.get('DPA_ANIO');
            var surfface = feature.get('superficie');
			var name_pob = feature.get('nam');
			if(name_can){
				console.log(feature);
				map.addOverlay(popup);
				titlos.innerHTML = 'Provincia<br>';
				contenido.innerHTML = "Ubicacion: "+name_prov +' - '+name_can+"<br>Superficie: "+parseFloat(surfface).toFixed(4) +"km";
				popup.setPosition(e.coordinate)
			}
			if (name_pob){
				map.addOverlay(popup);
				titlos.innerHTML = 'Poblado<br>';
				contenido.innerHTML = "Nombre: "+name_pob;
				popup.setPosition(e.coordinate)
			}
        }
        
        );
	});	    

}