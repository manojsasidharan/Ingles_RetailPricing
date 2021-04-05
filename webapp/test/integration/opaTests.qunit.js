/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/ingles/retail_pricing/Retail_Pricing/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});