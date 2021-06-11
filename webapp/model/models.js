sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		oViewModel: function () {
			var vModel = new JSONModel({
				"data": [{
					"row": "1"
				}]
			});
			vModel.setDefaultBindingMode("TwoWay");
			return vModel;
		},
		onewModel: function () {
			var queryData = {
				"PriceStrategy": "",
				"PriceType": "",
				"FromDate": "",
				"vendor": "",
				"vendorName": "",
				"vendorType": "",
				"multipleVendors": false
			};
			queryData.FromDate = this.getToday();
			var vModel = new JSONModel(queryData);
			vModel.setDefaultBindingMode("TwoWay");
			return vModel;
		},

		appControlModel: function () {
			var appData = {
				Currency: "USD",
				FilterInput: {
					Vendor: [],
					PriceType: "",
					PriceStrategy: "",
					Mode: 0,
					Edit: false
				}
			};
			var appControl = new JSONModel(appData);
			appControl.setDefaultBindingMode("TwoWay");
			return appControl;
		},

		masterDataModel: function () {
			var sPath = jQuery.sap.getModulePath("Ingles.Mock.Retail_Pricing", "/test/data/masterData.json");
			var masterDataModel = new JSONModel(sPath);
			return masterDataModel;
		},

		getToday: function () {
			var d = new Date(),
				month = "" + (d.getMonth() + 1),
				day = "" + d.getDate(),
				year = d.getFullYear();

			if (month.length < 2) {
				month = "0" + month;
			}
			if (day.length < 2) {
				day = "0" + day;
			}

			return [month, day, year].join("/");
		}

	};
});