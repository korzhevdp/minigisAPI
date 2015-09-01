//
// default map config file for integrity purposes
// settings provided in ymaps.js are about to override these settings for particular configs
//
var config,
	activeness,
	dX = [],
	cMapType      = 0,
	uploadPics    = [],
	typeselector,
	searchControl,
	revLayerTypes = {};

ymaps.ready(initconfig);

function initconfig(){
	config= {
		// tech-info
		photosOnStart : 0,
		demoMode      : 0,
		mcenter       : [40.537471, 64.543004],
		maxZoom       : 17,
		minZoom       : 4,
		initZoom      : 13,
		precision     : 12,
		proj          : ymaps.projection.sphericalMercator,
		// tech-info end
		url           : '/maps/arch1940/',			// корень каталог с тайлами карты
		hasNav        : 0,							// наличие навигатора
		hasAtlas      : 0,							// наличие подготовленного атласа карт
		hasMulti      : 0,							// наличие альтернативной смотрелки
		ownMarkers    : 0,							// возможность установить свой маркер левым щелчком по карте
		showObjects   : 0,							// показывать список объектов в навигаторе
		showClusters  : 0,							// показывать список кластеров в навигаторе
		showGroups    : 0,							// показывать список групп в навигаторе
		showObjectsOS : 0,							// показывать объекты на карте при старте
		showClustersOS: 0,							// показывать объекты кластеров на карте при старте
		showGroupsOS  : 0,							// показывать объекты групп на карте при старте
		selectors     : {
			systemNavigatorClass    : '.navigator',	// системный селектор навигаторов
			systemClustersContainer : '.clusters',	// системный контейнер списка кластеров в навигаторе
			systemGroupsContainer   : '.groups',	// системный контейнер списка групп в навигаторе
			systemObjectsContainer  : '.body',		// системный контейнер списка объектов в навигаторе
			systemActiveFlag        : ':checked',	// системный флаг активного элемента - класс или свойство
			systemObjectClass       : '.cb',		// системный селектор css-класса объектов в навигаторе
			systemObjectIdPrefix    : 'a',			// системный префикс атрибута id для объектов в навигаторе
			systemGroupClass        : '.gb',		// системный селектор css-класса групп в навигаторе
			systemGroupIdPrefix     : 'g',			// системный префикс атрибута id для групп в навигаторе
			systemClusterClass      : '.cl',		// системный селектор css-класса кластеров в навигаторе
			systemClusterIdPrefix   : 'cl',			// системный префикс атрибута id для кластеров в навигаторе
		},
		layerTypes    : {},
		objectSearch  : 0
	};
	activeness   = config.selectors.systemActiveFlag.replace(/^(\.|:)/, '');
	labelmode = (config.selectors.systemActiveFlag == ":checked") ? 1 : 0;
	searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 });
	typeSelector  = new ymaps.control.TypeSelector();

}