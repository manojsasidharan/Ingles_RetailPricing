sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	"sap/base/util/UriParameters",
	"sap/ui/comp/library",
	"sap/ui/model/type/String",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/SearchField",
	"sap/m/Token",
	"com/ingles/retail_pricing/Retail_Pricing/controller/ValueHelper"
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, UriParameters, compLibrary, typeString, ColumnListItem,
	Label, SearchField, Token, ValueHelper) {
	"use strict";

	return Controller.extend("com.ingles.retail_pricing.Retail_Pricing.controller.Master", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this._bDescendingSort = false;
			this._oMultiInput = this.getView().byId("VendorInput");
			// this._oMultiInput.addValidator(this.tokenUpdate);
			this._oMultiInput.setTokens(this._getDefaultTokens());
			var scPath = jQuery.sap.getModulePath("com.ingles.retail_pricing.Retail_Pricing", "/test/data/columnsModel.json");
			this.oColModel = new JSONModel(scPath);
			var sPPath = jQuery.sap.getModulePath("com.ingles.retail_pricing.Retail_Pricing", "/test/data/products.json");
			this.oProductsModel = new JSONModel(sPPath);
			this.getView().setModel(this.oProductsModel);

			this.oRouter.getRoute("notFound").attachPatternMatched(this._getQuery, this);

			this._vendorValueHelp = new ValueHelper(this, 'VENDOR');

		},

		_getQuery: function (oEvent) {

			var oHashChanger = new sap.ui.core.routing.HashChanger();
			var query = oHashChanger.getHash();
			var value = this.getAllUrlParams(query);

			if (value.pricestrategy !== undefined) {
				this.getOwnerComponent().getModel("query").setProperty("/PriceStrategy", decodeURIComponent(value.pricestrategy));
				this.getOwnerComponent().getModel("query").setProperty("/PriceType", decodeURIComponent(value.pricetype));

				if (decodeURIComponent(value.pricetype) === "20" & decodeURIComponent(value.pricestrategy) === "001") {
					this.getOwnerComponent().getModel("query").setProperty("/filename", "closeoutdata.json");
				} else if (decodeURIComponent(value.pricetype) === "01" & decodeURIComponent(value.pricestrategy) === "001") {
					this.getOwnerComponent().getModel("query").setProperty("/filename", "data.json");
				} else if (decodeURIComponent(value.pricetype) === "01" & decodeURIComponent(value.pricestrategy) === "213") {
					this.getOwnerComponent().getModel("query").setProperty("/filename", "dsdregular.json");
				} else if (decodeURIComponent(value.pricetype) === "20" & decodeURIComponent(value.pricestrategy) === "201") {
					this.getOwnerComponent().getModel("query").setProperty("/filename", "dsdclose.json");
				}
			}

		},
		// _onMultiInputValidate: function (oArgs) {
		// 	if (oArgs.suggestionObject) {
		// 		var oObject = oArgs.suggestionObject.getBindingContext().getObject(),
		// 			oToken = new Token();

		// 		oToken.setKey(oObject.ProductId);
		// 		oToken.setText(oObject.Name + " (" + oObject.ProductId + ")");
		// 		return oToken;
		// 	}

		// 	return null;
		// },
		
		tokenUpdate: function (oEvent, oPath) {
			var sType = oEvent.getParameter("type"),
				aAddedTokens = oEvent.getParameter("addedTokens"),
				aRemovedTokens = oEvent.getParameter("removedTokens"),
				oModel = this.getView().getModel("appControl"),
				aContexts = oModel.getProperty(oPath);

			switch (sType) {
				// add new context to the data of the model, when new token is being added
			case "added":
				aAddedTokens.forEach(function (oToken) {
					aContexts.push({
						key: oToken.getKey(),
						text: oToken.getKey()
					});
				});
				break;
				// remove contexts from the data of the model, when tokens are being removed
			case "removed":
				aRemovedTokens.forEach(function (oToken) {
					aContexts = aContexts.filter(function (oContext) {
						return oContext.key !== oToken.getKey();
					});
				});
				break;
			default:
				break;
			}

			oModel.setProperty(oPath, aContexts);

		},		
		
		_getDefaultTokens: function () {
			var oToken1 = new Token({
				key: "DC10",
				text: "DC10"
			});

			return [oToken1];
		},
		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
				productPath = oEvent.getSource().getBindingContext("products").getPath(),
				product = productPath.split("/").slice(-1).pop();

			this.oRouter.navTo("detail", {
				layout: oNextUIState.layout,
				product: product
			}, true);
		},
		onSearch: function (oEvent) {
			if (this.getOwnerComponent().getModel("query").getProperty("/PriceStrategy") !== "") {

				this.getOwnerComponent().getModel("query").setProperty("/PriceStrategy", this.getView().byId("Strategy").getSelectedItem().getText());
				this.getOwnerComponent().getModel("query").setProperty("/PriceType", this.getView().byId("Type").getSelectedItem().getText());
			}
			this.getOwnerComponent().getModel("query").setProperty("/PriceFamily", this.getView().byId("pricfam").getSelectedItem());
			this.getOwnerComponent().getModel("query").setProperty("/CostFamily", this.getView().byId("costfam").getSelectedItem());

			if (this.getView().byId("RB1").getSelected() === true) {
				this.getOwnerComponent().getModel("query").setProperty("/Mode", "01");
			} else {
				this.getOwnerComponent().getModel("query").setProperty("/Mode", "02");
			}

			this.oRouter.navTo("detail", {
				layout: "MidColumnFullScreen",
				product: "95"
			}, true);
		},

		onAdd: function (oEvent) {
			MessageBox.show("This functionality is not ready yet.", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Aw, Snap!",
				actions: [MessageBox.Action.OK]
			});
		},

		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("Name", this._bDescendingSort);

			oBinding.sort(oSorter);
		},
		getAllUrlParams: function (url) {

			// get query string from url (optional) or window
			var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

			// we'll store the parameters here
			var obj = {};
			var attribute = "";
			var componentData = this.getOwnerComponent().getComponentData();
			for (var property in componentData.startupParameters) {
				attribute = property.toLowerCase();
				obj[attribute] = componentData.startupParameters[property][0];
			}
			return obj;

			// if query string exists
			if (queryString) {

				// stuff after # is not part of query string, so get rid of it
				queryString = queryString.split('#')[0];

				// split our query string into its component parts
				var arr = queryString.split('&');

				for (var i = 0; i < arr.length; i++) {
					// separate the keys and the values
					var a = arr[i].split('=');

					// set parameter name and value (use 'true' if empty)
					var paramName = a[0];
					var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

					// (optional) keep case consistent
					paramName = paramName.toLowerCase();
					if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

					// if the paramName ends with square brackets, e.g. colors[] or colors[2]
					if (paramName.match(/\[(\d+)?\]$/)) {

						// create key if it doesn't exist
						var key = paramName.replace(/\[(\d+)?\]/, '');
						if (!obj[key]) obj[key] = [];

						// if it's an indexed array e.g. colors[2]
						if (paramName.match(/\[\d+\]$/)) {
							// get the index value and add the entry at the appropriate position
							var index = /\[(\d+)\]/.exec(paramName)[1];
							obj[key][index] = paramValue;
						} else {
							// otherwise add the value to the end of the array
							obj[key].push(paramValue);
						}
					} else {
						// we're dealing with a string
						if (!obj[paramName]) {
							// if it doesn't exist, create property
							obj[paramName] = paramValue;
						} else if (obj[paramName] && typeof obj[paramName] === 'string') {
							// if property does exist and it's a string, convert it to an array
							obj[paramName] = [obj[paramName]];
							obj[paramName].push(paramValue);
						} else {
							// otherwise add the property
							obj[paramName].push(paramValue);
						}
					}
				}
			}

			return obj;
		},
		// onValueHelpRequested: function () {
		// 	var aCols = this.oColModel.getData().cols;
		// 	this._oBasicSearchField = new SearchField({
		// 		showSearchButton: false
		// 	});

		// 	this._oValueHelpDialog = sap.ui.xmlfragment("com.ingles.retail_pricing.Retail_Pricing.fragments.ValueHelpDialogFilterbar", this);
		// 	this.getView().addDependent(this._oValueHelpDialog);

		// 	this._oValueHelpDialog.setRangeKeyFields([{
		// 		label: "Product",
		// 		key: "ProductId",
		// 		type: "string",
		// 		typeInstance: new typeString({}, {
		// 			maxLength: 7
		// 		})
		// 	}]);

		// 	var oFilterBar = this._oValueHelpDialog.getFilterBar();
		// 	oFilterBar.setFilterBarExpanded(false);
		// 	oFilterBar.setBasicSearch(this._oBasicSearchField);

		// 	this._oValueHelpDialog.getTableAsync().then(function (oTable) {
		// 		oTable.setModel(this.oProductsModel);
		// 		oTable.setModel(this.oColModel, "columns");

		// 		if (oTable.bindRows) {
		// 			oTable.bindAggregation("rows", "/ProductCollection");
		// 		}

		// 		if (oTable.bindItems) {
		// 			oTable.bindAggregation("items", "/ProductCollection", function () {
		// 				return new ColumnListItem({
		// 					cells: aCols.map(function (column) {
		// 						return new Label({
		// 							text: "{" + column.template + "}"
		// 						});
		// 					})
		// 				});
		// 			});
		// 		}

		// 		this._oValueHelpDialog.update();
		// 	}.bind(this));

		// 	this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
		// 	this._oValueHelpDialog.open();
		// },

		onVendorValueHelp: function (oEvent) {
			this._vendorValueHelp.openValueHelp(oEvent);
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput.setTokens(aTokens);
			this._oValueHelpDialog.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},
		onFilterBarSearch: function (oEvent) {
			var sSearchQuery = this._oBasicSearchField.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			aFilters.push(new Filter({
				filters: [
					new Filter({
						path: "ProductId",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Name",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Category",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					})
				],
				and: false
			}));

			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},
		_filterTable: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		},
		onValueHelpWithSuggestionsRequested: function () {
			var aCols = this.oColModel.getData().cols;
			this._oBasicSearchFieldWithSuggestions = new SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialogWithSuggestions = sap.ui.xmlfragment(
				"com.ingles.retail_pricing.Retail_Pricing.fragments.ValueHelpDialogFilterbarWithSuggestions", this);
			this.getView().addDependent(this._oValueHelpDialogWithSuggestions);

			this._oValueHelpDialogWithSuggestions.setRangeKeyFields([{
				label: "Product",
				key: "ProductId",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 7
				})
			}]);

			var oFilterBar = this._oValueHelpDialogWithSuggestions.getFilterBar();
			oFilterBar.setFilterBarExpanded(false);
			oFilterBar.setBasicSearch(this._oBasicSearchFieldWithSuggestions);

			this._oValueHelpDialogWithSuggestions.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oProductsModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/ProductCollection");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/ProductCollection", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}

				this._oValueHelpDialogWithSuggestions.update();
			}.bind(this));

			this._oValueHelpDialogWithSuggestions.setTokens(this._oMultiInput.getTokens());
			this._oValueHelpDialogWithSuggestions.open();
		},
		onValueHelpWithSuggestionsOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInputWithSuggestions.setTokens(aTokens);
			this._oValueHelpDialogWithSuggestions.close();
		},

		onValueHelpWithSuggestionsCancelPress: function () {
			this._oValueHelpDialogWithSuggestions.close();
		},

		onValueHelpWithSuggestionsAfterClose: function () {
			this._oValueHelpDialogWithSuggestions.destroy();
		},
		onFilterBarWithSuggestionsSearch: function (oEvent) {
			var sSearchQuery = this._oBasicSearchFieldWithSuggestions.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			aFilters.push(new Filter({
				filters: [
					new Filter({
						path: "ProductId",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Name",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Category",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					})
				],
				and: false
			}));

			this._filterTableWithSuggestions(new Filter({
				filters: aFilters,
				and: true
			}));
		},
		_filterTableWithSuggestions: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialogWithSuggestions;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		}
	});
});