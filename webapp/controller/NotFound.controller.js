sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("com.ingles.retail_pricing.Retail_Pricing.controller.NotFound", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
		}
	});	
});