/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"Ingles/Mock/Retail_Pricing/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});