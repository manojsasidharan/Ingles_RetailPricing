sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/ingles/retail_pricing/Retail_Pricing/model/models",
	"sap/f/library",
	"sap/f/FlexibleColumnLayoutSemanticHelper",
	"sap/ui/model/json/JSONModel"
], function (UriParameters, UIComponent, Device, models, library, FlexibleColumnLayoutSemanticHelper, JSONModel) {
	"use strict";
	var LayoutType = library.LayoutType;

	var Component = UIComponent.extend("com.ingles.retail_pricing.Retail_Pricing.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			var oModel = new JSONModel();
			this.setModel(oModel);
			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.oViewModel(),"addrow");
			this.setModel(models.onewModel(),"query");
		
		},
		getHelper: function () {
			var oFCL = this.getRootControl().byId("app"),
			
				oSettings = {
					defaultTwoColumnLayoutType: LayoutType.TwoColumnsBeginExpanded,
					defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
					initialColumnsCount: 2,
					maxColumnsCount: 2
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}
	});
	return Component;
});