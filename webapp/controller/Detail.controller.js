sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/ui/core/message/Message",
	"sap/ui/core/Core",
	"sap/m/Button",
	"sap/ui/core/IconPool",
	"sap/m/MessageView",
	"sap/m/Dialog",
	"sap/m/Bar",
	"sap/m/Text",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast"

], function (JSONModel, Controller, MessageItem, MessagePopover, Message, Core, Button, IconPool, MessageView, Dialog, Bar, Text,
	UploadCollectionParameter, MessageToast) {
	"use strict";

	return Controller.extend("Ingles.Mock.Retail_Pricing.controller.Detail", {
		onInit: function () {

			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("master").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
			this._messageManager = Core.getMessageManager();
			this._messageManager.registerObject(this.getView(), true);
			this.oView.setModel(this._messageManager.getMessageModel(), "message");

			//this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onProductMatched, this);

			[oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (this.bFocusFullScreenButton) {
							this.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(this)
				});
			}, this);
		},
		handleItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
				supplierPath = oEvent.getSource().getBindingContext("products").getPath(),
				supplier = supplierPath.split("/").slice(-1).pop();

			this.oRouter.navTo("detailDetail", {
				layout: oNextUIState.layout,
				product: "1",
				supplier: supplier
			}, true);
		},
		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");

			this.oRouter.navTo("detail", {
				layout: "MidColumnFullScreen",
				product: "1"
			}, true);
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {
				layout: "OneColumn",
				product: "1"
			}, true);
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {
				layout: sNextLayout
			}, true);
		},
		clearAllFilters: function (oEvent) {
			var conditionTable = this.getView().byId("Table");
			var aColumns = conditionTable.getColumns();

			for (var i = 0; i < aColumns.length; i++) {
				conditionTable.filter(aColumns[i], null);
			}
			var filters = [];
			conditionTable.getBinding("rows").filter(filters, sap.ui.model.FilterType.Application);

		},
		onSync: function (oEvent) {
			if (this.getOwnerComponent().getModel("query").getProperty("/PriceFamily") != undefined) {
				var selection = this.getOwnerComponent().getModel("query").getProperty("/PriceFamily").getKey();
			}

			var mode = this.getOwnerComponent().getModel("query").getProperty("/Mode");
			var file = this.getOwnerComponent().getModel("query").getProperty("/filename");
			if (mode === "02") {
				var conditionTable = this.getView().byId("Table");
				var sPath = jQuery.sap.getModulePath("Ingles.Mock.Retail_Pricing", "/test/data/" + file);
				var attModel = new JSONModel(sPath);
				// attModel.setDefaultBindingMode("OneWay");
				this.getView().setModel(attModel);
				conditionTable.bindRows("/Data");
				this.getView().byId("Ttitle").setText("Retail Pricing ( 9 )");
				this.getView().getModel().refresh();
				conditionTable.rerender();
				conditionTable.setVisibleRowCount(9);
			} else {

				conditionTable = this.getView().byId("Table");
				sPath = jQuery.sap.getModulePath("Ingles.Mock.Retail_Pricing", "/test/data/createdata.json");
				attModel = new JSONModel(sPath);
				// attModel.setDefaultBindingMode("OneWay");
				this.getView().setModel(attModel);
				conditionTable.bindRows("/Data");
				attModel.refresh();
				this.getView().byId("Table").rerender();
				this.getView().byId("Ttitle").setText("Retail Pricing (" + 0 + ")");
				this.getView().byId("Table").setVisibleRowCount(9);
				this.geteditrows(0, 9);
			}
			var that = this;
			setTimeout(function () {
				that.firstcalculate();
			}, 250);

		},
		_onProductMatched: function (oEvent) {
			if (this.getOwnerComponent().getModel("query").getProperty("/PriceFamily") != undefined) {
				var selection = this.getOwnerComponent().getModel("query").getProperty("/PriceFamily").getKey();
			}
			var mode = this.getOwnerComponent().getModel("query").getProperty("/Mode");
			var file = "AllData.json"; //this.getOwnerComponent().getModel("query").getProperty("/filename");
			var appControlModel = this.getOwnerComponent().getModel("appControl");
			if (mode === "02") {
				appControlModel.setProperty("/FilterInput/Edit", false);
				var conditionTable = this.getView().byId("Table");
				var sPath = jQuery.sap.getModulePath("Ingles.Mock.Retail_Pricing", "/test/data/" + file);
				var attModel = new JSONModel(sPath);
				attModel.attachRequestCompleted(function () {
					var dataArray = attModel.getData().Data;
					var filteredArray = [];
					var vendTokens = appControlModel.getProperty("/FilterInput/Vendor");
					var priceType = appControlModel.getProperty("/FilterInput/PriceType"),
						priceStrategy = appControlModel.getProperty("/FilterInput/PriceStrategy");

					for (var i = 0; i < dataArray.length; i++) {

						if (((priceType !== "" && dataArray[i].pricetype === priceType) || priceType === "") &&
							((priceStrategy !== "" && dataArray[i].pricestrategy === priceStrategy) || priceStrategy === "")) {
							if (vendTokens.length === 0)
								filteredArray.push(dataArray[i]);
							else {
								for (var j = 0; j < vendTokens.length; j++) {
									if (dataArray[i].Vendor === vendTokens[j].key) {
										filteredArray.push(dataArray[i]);
										break;
									}
								}
							}
						}
					}
					this.getView().setModel(new JSONModel({
						Data: filteredArray
					}));
					conditionTable.bindRows("/Data");
					this.getView().byId("Ttitle").setText("Retail Pricing (" + filteredArray.length + ")");
					this.onfirstdisplay();
					// this.calculate(true, "", "");

				}.bind(this));

			} else {
				this.getView().getModel("appControl").setProperty("/FilterInput/Edit", true);
				conditionTable = this.getView().byId("Table");
				sPath = jQuery.sap.getModulePath("Ingles.Mock.Retail_Pricing", "/test/data/createdata.json");
				attModel = new JSONModel(sPath);
				attModel.setDefaultBindingMode("OneWay");
				this.getView().setModel(attModel);
				conditionTable.bindRows("/Data");
				attModel.refresh();
				this.getView().byId("Table").rerender();
				this.getView().byId("Ttitle").setText("Retail Pricing (" + 0 + ")");
				this.getView().byId("Table").setVisibleRowCount(9);
				this.geteditrows(0, 9);
			}

		},
		onPress: function () {

			var oTable = this.getView().byId("Table");
			var itemModel = this.getView().getModel();
			oTable.getColumns()[0].getAggregation("template").setEditable(false);
			oTable.getColumns()[1].getAggregation("template").setEditable(false);
			// oTable.getColumns()[2].getAggregation("template").setEditable(false);
			// oTable.getColumns()[4].getAggregation("template").setEditable(false);
			// oTable.getColumns()[5].getAggregation("template").setEditable(false);
			oTable.getColumns()[4].getAggregation("template").getItems()[0].setEditable(false);
			this.getView().byId("UploadCollection").setUploadButtonInvisible(true);
			this.getView().byId("UploadCollection").setUploadEnabled(false);
			itemModel.refresh();
			oTable.rerender();

		},
		onfirstdisplay: function (oEvent) {

			// var oTable = this.getView().byId("Table");
			// var oRows = oTable.getRows();
			// for (var i = 0; i < oRows.length; i++) {
			// 	// var oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", true);
			// 	// oCell = oRows[i].getCells()[5];
			// 	// var oCell.setProperty("editable", true);
			// 	var oCell = oRows[i].getCells()[0].getItems()[1];
			// 	oCell.setProperty("editable", false);
			// 	oCell = oRows[i].getCells()[1];
			// 	oCell.setProperty("editable", false);
			// 	// oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", false);
			// 	oCell = oRows[i].getCells()[7];
			// 	oCell.getItems()[0].setProperty("editable", false);
			// }
			this.onEditAction();

			var that = this;
			setTimeout(function () {
				that.firstcalculate();
			}, 1000);
		},
		firstcalculate: function () {
			var oTable = this.getView().byId("Table");
			var oRows = oTable.getRows(),
				cost, allow, retailprice, GM, finalGM, GMwithAllow, finalGMwithAllow;

			var oModel = this.getView().getModel();
			var sPath = "";

			for (var i = 0; i < oModel.getProperty("/Data").length; i++) {
				// cost = oRows[i].getCells()[3].getText();
				// allow = oRows[i].getCells()[4].getText();
				// retailprice = oRows[i].getCells()[7].getItems()[0].getValue();

				sPath = "/Data/" + i;
				cost = oModel.getProperty(sPath + "/Last_Cost");
				allow = oModel.getProperty(sPath + "/Allowance");
				retailprice = oModel.getProperty(sPath + "/Price");

				GM = ((parseFloat(retailprice, 2) - parseFloat(cost, 2)) / parseFloat(retailprice, 2)) * 100;
				finalGM = isNaN(GM) ? 0 : GM.toFixed(2);

				GMwithAllow = ((parseFloat(retailprice, 2) - parseFloat(cost, 2) + parseFloat(allow, 2)) / parseFloat(retailprice, 2)) * 100;
				finalGMwithAllow = isNaN(GMwithAllow) ? 0 : GMwithAllow.toFixed(2);

				var check = oRows[i].getCells()[0].getItems()[1].getValue();
				if (check === "") {
					// oRows[i].getCells()[8].setText("");
					// oRows[i].getCells()[9].setText("");
					oModel.setProperty(sPath + "/allow", "");
					oModel.setProperty(sPath + "/new_allow", "");
				} else {
					// oRows[i].getCells()[8].setText(finalGM);
					// oRows[i].getCells()[9].setText(finalGMwithAllow);
					oModel.setProperty(sPath + "/allow", finalGM);
					oModel.setProperty(sPath + "/new_allow", finalGMwithAllow);
				}

			}

		},
		onEdit: function (oEvent) {

			if (this.getOwnerComponent().getModel("query").getProperty("/PriceFamily") != undefined) {
				var selection = this.getOwnerComponent().getModel("query").getProperty("/PriceFamily").getKey();
			}

			// var oTable = this.getView().byId("Table");
			// var oRows = oTable.getRows();
			// for (var i = 0; i < oRows.length; i++) {
			// 	// var oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", true);
			// 	// oCell = oRows[i].getCells()[5];
			// 	// var oCell.setProperty("editable", true);
			// 	if (selection !== "0000") {
			// 		var oCell = oRows[i].getCells()[0].getItems()[1];
			// 		oCell.setProperty("editable", false);
			// 		oCell = oRows[i].getCells()[1];
			// 		oCell.setProperty("editable", false);
			// 	} else {
			// 		oCell = oRows[i].getCells()[0].getItems()[1];
			// 		oCell.setProperty("editable", true);
			// 		oCell = oRows[i].getCells()[1];
			// 		oCell.setProperty("editable", true);
			// 	}
			// 	// oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", false);
			// 	oCell = oRows[i].getCells()[7];
			// 	oCell.getItems()[0].setProperty("editable", true);
			// }

			this.getView().getModel("appControl").setProperty("/FilterInput/Edit", true);

			this.onEditAction();
		},
		seteditrowsdisble: function () {
			// var oTable = this.getView().byId("Table");
			// var oRows = oTable.getRows();
			// for (var i = 0; i < oRows.length; i++) {
			// 	// var oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", true);
			// 	// oCell = oRows[i].getCells()[5];
			// 	// oCell.setProperty("editable", true);
			// 	var oCell = oRows[i].getCells()[0].getItems()[1];
			// 	oCell.setProperty("editable", false);
			// 	oCell = oRows[i].getCells()[1];
			// 	oCell.setProperty("editable", false);
			// 	// oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", false);
			// 	oCell = oRows[i].getCells()[7];
			// 	oCell.getItems()[0].setProperty("editable", true);
			// }
		},
		seteditcreate: function () {
			// var oTable = this.getView().byId("Table");
			// var oRows = oTable.getRows();
			// for (var i = 0; i < oRows.length; i++) {
			// 	// var oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", true);
			// 	// oCell = oRows[i].getCells()[5];
			// 	// oCell.setProperty("editable", true);
			// 	var oCell = oRows[i].getCells()[0].getItems()[1];
			// 	oCell.setProperty("editable", true);
			// 	oCell = oRows[i].getCells()[1];
			// 	oCell.setProperty("editable", true);
			// 	// oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", true);
			// 	oCell = oRows[i].getCells()[7];
			// 	oCell.getItems()[0].setProperty("editable", true);
			// }
			this.onEditAction();
		},
		geteditrows: function (start, end) {
			// var oTable = this.getView().byId("Table");
			// var oRows = oTable.getRows();
			// for (var i = start; i < end; i++) {
			// 	// var oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", true);
			// 	// oCell = oRows[i].getCells()[5];
			// 	// oCell.setProperty("editable", true);
			// 	var oCell = oRows[i].getCells()[0].getItems()[1];
			// 	oCell.setProperty("editable", true);
			// 	oCell = oRows[i].getCells()[1];
			// 	oCell.setProperty("editable", true);
			// 	// oCell = oRows[i].getCells()[4];
			// 	// oCell.setProperty("editable", true);
			// 	oCell = oRows[i].getCells()[7];
			// 	oCell.getItems()[0].setProperty("editable", true);
			// }
			this.onEditAction();
		},

		onreset: function (oEvent) {
			var oModel = this.getView().getModel();
			var path = oEvent.getSource().getParent().getParent().getBindingContext().getPath();
			var oldValue = oModel.getProperty(path + "/Curr_Price");
			oModel.setProperty(path + "/Price", oldValue);

			var table = this.getView().byId("Table");
			var oRow = oEvent.getSource().getParent().getParent().getBindingContext().getPath().slice(6);
			this.calculate(oRow, table);
			table.removeSelectionInterval(oRow, oRow);
		},
		calculate: function (row, oTable) {
			// var oRows = oTable.getRows();
			// var cost = oRows[row].getCells()[3].getText();
			// var allow = oRows[row].getCells()[4].getText();
			// var retailprice = oRows[row].getCells()[7].getItems()[0].getValue();

			var oModel = this.getView().getModel(),
				sPath = "/Data/" + row;
			var cost = oModel.getProperty(sPath + "/Last_Cost");
			var allow = oModel.getProperty(sPath + "/Allowance");
			var retailprice = oModel.getProperty(sPath + "/Price");

			var GM = ((parseFloat(retailprice, 2) - parseFloat(cost, 2)) / parseFloat(retailprice, 2)) * 100;
			var finalGM = isNaN(GM) ? 0 : GM.toFixed(2);

			var GMwithAllow = ((parseFloat(retailprice, 2) - parseFloat(cost, 2) + parseFloat(allow, 2)) / parseFloat(retailprice, 2)) * 100;
			var finalGMwithAllow = isNaN(GMwithAllow) ? 0 : GMwithAllow.toFixed(2);

			if (oTable.getRows()[0].getCells()[0].getItems()[1].getValue() !== "") {
				// oTable.getRows()[row].getCells()[8].setText(finalGM);
				// oTable.getRows()[row].getCells()[9].setText(finalGMwithAllow);
				oModel.setProperty(sPath + "/allow", finalGM);
				oModel.setProperty(sPath + "/new_allow", finalGMwithAllow);
			}

		},
		livecalculate: function (oEvent) {
			var oTable = this.getView().byId("Table");
			var row = oEvent.getSource().getParent().getParent().getBindingContext().getPath().slice(6);

			// var oRows = oTable.getRows();
			// var cost = oRows[row].getCells()[3].getText();
			// var allow = oRows[row].getCells()[4].getText();
			// var retailprice = oRows[row].getCells()[7].getItems()[0].getValue();
			var oModel = this.getView().getModel();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var cost = oModel.getProperty(sPath + "/Last_Cost");
			var allow = oModel.getProperty(sPath + "/Allowance");
			var retailprice = oEvent.getSource().getValue(); //oModel.getProperty( sPath + "/Price" );

			var GM = ((parseFloat(retailprice, 2) - parseFloat(cost, 2)) / parseFloat(retailprice, 2)) * 100;
			var finalGM = isNaN(GM) ? 0 : GM.toFixed(2);

			var GMwithAllow = ((parseFloat(retailprice, 2) - parseFloat(cost, 2) + parseFloat(allow, 2)) / parseFloat(retailprice, 2)) * 100;
			var finalGMwithAllow = isNaN(GMwithAllow) ? 0 : GMwithAllow.toFixed(2);

			// oTable.getRows()[row].getCells()[8].setText(finalGM);
			// oTable.getRows()[row].getCells()[9].setText(finalGMwithAllow);
			oModel.setProperty(sPath + "/allow", finalGM);
			oModel.setProperty(sPath + "/new_allow", finalGMwithAllow);

			oTable.addSelectionInterval(row, row);
		},
		onDeletePress: function (oEvent) {
			// var itemModel = this.getView().getModel(),
			// 	oRow = oEvent.getParameter("row"),
			// 	sIndex = oRow.getBindingContext().sPath.split("/")[2];
			// itemModel.getData().Data.splice(sIndex, 1);
			// itemModel.refresh();

			var itemModel = this.getView().byId("Table").getModel();
			var oTable = this.getView().byId("Table");
			var indices = oTable.getSelectedIndices();
			if (indices.length === 0) {
				MessageToast.show("Select atleast one row");
				return;
			}
			indices.sort(function (a, b) {
				return b - a;
			});
			for (var i = 0; i < indices.length; i++) {
				itemModel.getData().Data.splice(indices[i], 1);
			}
			itemModel.refresh();

			this.getView().byId("Ttitle").setText("Retail Pricing (" + itemModel.getData().Data.length + ")");
		},
		onEditAction: function (oEvent) {
			this.getView().byId("Tfilter").setVisible(true);
			this.getView().byId("Treset").setVisible(true);
			this.getView().byId("Tcreate").setVisible(true);
			this.getView().byId("RB1").setEnabled(true);
			this.getView().byId("RB2").setEnabled(true);
			//this.getView().byId("BCopy").setVisible(true);
			this.getView().byId("Bactive").setVisible(true);
			this.getView().byId("Bsave").setVisible(true);
			this.getView().byId("UploadCollection").setUploadButtonInvisible(false);
			this.getView().byId("UploadCollection").setUploadEnabled(true);
		},
		onAddDialogSubmit: function (oEvent) {
			this.addRowsDialog.close();
			this.addRowsDialog.destroy();
			var value = this.addRowsDialog.getModel().getData().data.row,
				i;
			var initialcheck = 0,
				initialdata;
			var itemModel = this.getView().getModel();

			if (itemModel.getData().Data === undefined) {
				var exist = itemModel.getData();
				exist.Data = [];
				itemModel.setData(exist);
				initialcheck = 1;
				initialdata = 0;
			} else {
				initialdata = itemModel.getData().Data.length;
			}

			for (i = 0; i < value; i++) {
				itemModel.getData().Data.push({
					"LocationCode": "",
					"Material": "",
					"Vendor": "",
					"Description": "",
					"valid_from": "",
					"valid_to": "12/31/9999",
					"Last_Cost": "",
					"Price": "",
					"Margin": "",
					"Unit_sell": "",
					"Multiplier": ""
				});
			}
			if (initialcheck === 1) {
				this.getView().byId("Table").bindRows("/Data");
			}
			this.getView().byId("Ttitle").setText("Retail Pricing (" + itemModel.getData().Data.length + ")");
			this.getView().byId("Table").setVisibleRowCount(itemModel.getData().Data.length);
			itemModel.refresh();
			this.getView().byId("Table").rerender();
			this.geteditrows(initialdata, initialdata + parseInt(value));

		},
		onAddRows: function (oEvent) {
			this.addRowsDialog = sap.ui.xmlfragment("Ingles.Mock.Retail_Pricing.fragments.AddRows", this);

			//this.getOwnerComponent().getModel("addrow").setData("");
			this.addRowsDialog.setModel(this.getOwnerComponent().getModel("addrow"));
			this.getView().addDependent(this.addRowsDialog);
			this.addRowsDialog.open();
		},
		onAddDialogCancel: function () {
			this.addRowsDialog.close();
			this.addRowsDialog.destroy();
		},
		onUploadSelectedButton: function (oEvent) {
			//var item = oEvent.getSource().getParent().getParent().getItems();
			//	if (item.length > 0) {
			// oEvent.getSource().getParent().getParent().getItems()[0].getAggregation("content")[1].getProperty("item").getAggregation(
			// 	"dependents")[1].getAggregation("items")[0].setPercentValue(100);

			// oEvent.getSource().getParent().getParent().getItems()[0].getAggregation("content")[1].getProperty("item").getAggregation(
			// 	"dependents")[1].getAggregation("items")[1].getAggregation("items")[0].setText("Complete");

			// oEvent.getSource().getParent().getParent().getItems()[0].getAggregation("content")[1].getProperty("item").getAggregation(
			// 	"dependents")[1].getAggregation("items")[1].getAggregation("items")[1].setText("100%");

			this.getView().byId("ObjectPageLayout").setSelectedSection(this.getView().byId("massmaint").getId());

			//	}

		},
		handleMessagePopoverPress: function (oEvent) {
			if (!this.oMP) {
				this.createMessagePopover(this.oView);
			}
			this.oMP.toggle(oEvent.getSource());
		},
		onsave: function (oEvent) {
			sap.ui.getCore().getMessageManager().removeAllMessages();
			this.addMessageToTarget("", "", "SAP Price document number 45789 created successfully!!", "Success",
				"",
				"S", "");

			//this.addMessageToTarget("", "", "Please enter valid Price", "Error", "Please check the Price at Row 2", "E", "");

			this.createdialog();
		},

		createdialog: function () {
			var that = this;
			var oBackButton = new Button({
				icon: IconPool.getIconURI("nav-back"),
				visible: false,
				press: function () {
					that.oMessageView.navigateBack();
					this.setVisible(false);
				}
			});

			this.oMessageView = new MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "message>/",
					template: new MessageItem({
						title: "{message>message}",
						subtitle: "{message>additionalText}",
						activeTitle: true,
						description: "{message>description}",
						type: "{message>type}"
					})
				},
				groupItems: true
			});

			this.getView().addDependent(this.oMessageView);
			this.oDialog = new Dialog({
				content: this.oMessageView,
				contentHeight: "50%",
				contentWidth: "50%",
				endButton: new Button({
					text: "Close",
					press: function () {
						this.getParent().close();
					}
				}),
				customHeader: new Bar({
					contentMiddle: [
						new Text({
							text: "Message Manager"
						})
					],
					contentLeft: [oBackButton]
				}),

				verticalScrolling: false
			});
			this.oMessageView.navigateBack();
			this.oDialog.open();
		},
		createMessagePopover: function () {
			this.oMP = new MessagePopover({
				items: {
					path: "message>/",
					template: new MessageItem({
						title: "{message>message}",
						subtitle: "{message>additionalText}",
						activeTitle: true,
						description: "{message>description}",
						type: "{message>type}"
					})
				}
			});
			this.oMP._oMessageView.setGroupItems(true);
			this.oMP._oPopover.setContentWidth("600px");
			this.oView.addDependent(this.oMP);
		},
		addMessageToTarget: function (sTarget, controlId, errorMessage, errorTitle, errorDescription, msgType, groupName) {
			var oMessage = new Message({
				message: errorMessage,
				type: this.getMessageType(msgType),
				additionalText: errorTitle,
				description: errorDescription,
				target: sTarget,
				processor: this._mainModel,
				code: groupName
			});

			if (controlId !== "") {
				oMessage.addControlId(controlId);
			}

			this._messageManager.addMessages(oMessage);
		},
		getMessageType: function (msgType) {
			var rtnType;
			switch (msgType) {
			case "E":
				rtnType = sap.ui.core.MessageType.Error;
				break;
			case "S":
				rtnType = sap.ui.core.MessageType.Success;
				break;
			case "I":
				rtnType = sap.ui.core.MessageType.Information;
				break;
			case "W":
				rtnType = sap.ui.core.MessageType.Warning;
				break;
			default:
				rtnType = sap.ui.core.MessageType.None;
				break;
			}
			return rtnType;
		},
		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

		},
		onUploadComplete: function (oEvent) {
			var process = this.byId("RB").getSelectedButton().getText();
			if (process === "Online") {
				this.onSync();
				var oUploadCollection = this.byId("UploadCollection");
				var oData = oUploadCollection.getModel().getData();
				if (oData.items === undefined) {
					oData = {
						"items": []
					};
				}

				oData.items.unshift({
					"documentId": Date.now().toString(), // generate Id,
					"fileName": oEvent.getParameter("files")[0].fileName,
					"mimeType": "",
					"thumbnailUrl": "",
					"url": "",
					"attributes": [{
						"title": "Uploaded By",
						"text": "You",
						"active": false
					}, {
						"title": "Uploaded On",
						"text": new Date().toLocaleDateString(),
						"active": false
					}, {
						"title": "File Size",
						"text": "505000",
						"active": false
					}],
					"statuses": [{
						"title": "",
						"text": "",
						"state": "None"
					}],
					"markers": [{}],
					"selected": false
				});
				this.getView().byId("Table").setVisibleRowCount(9);
				this.getView().byId("Table").rerender();
				this.getView().getModel().refresh();
				oUploadCollection.rerender();

				// Sets the text to the label
				this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
				this.seteditrowsdisble();
				// delay the success message for to notice onChange message
				this.onUploadSelectedButton();

			} else {
				this.onsave();
			}
		},
		getAttachmentTitleText: function () {
			var aItems = this.byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},
		onChange: function (oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},
		onFileDeleted: function (oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"));
		},

		deleteItemById: function (sItemToDeleteId) {
			var oData = this.byId("UploadCollection").getModel().getData();
			var aItems = oData.items;
			jQuery.each(aItems, function (index) {
				if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});
			this.byId("UploadCollection").getModel().setData({
				"items": aItems
			});
			this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
		},

		colorCode: function (isParent, Family, Material) {
			if (Family !== "") {
				if (isParent) return "#0d6733"; //Dark Green
				else return "#16ab54"; //Light Green
			} else if (Material !== "" && Material !== undefined)
				return "#72b5f8"; //Blue
			else return "";
		},

		onMaterialInput: function (oEvent) {
			var matnr = oEvent.getSource().getValue();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var data = [{
				Family: "",
				IsParent: false,
				LocationCode: "1005",
				Material: "22220",
				Vendor: "909991",
				Description: "JFG MAYONNAISE",
				valid_from: "5/2/2021",
				valid_to: "12/31/9999",
				Last_Cost: "2.52",
				Margin: "23.17",
				Unit_sell: "3.28",
				Multiplier: "1",
				UPC: "4141030751",
				Color: "#40916C",
				Allowance: "0.27"
			}, {
				Family: "",
				IsParent: false,				
				LocationCode: "1005",
				Material: "22233",
				Vendor: "909991",
				Description: "JFG SALAD DRESSING",
				valid_from: "5/2/2021",
				valid_to: "12/31/9999",
				Last_Cost: "2.52",
				Margin: "23.27",
				Unit_sell: "3.28",
				Multiplier: "1",
				UPC: "4141030753",
				Color: "#40916C",
				Allowance: "0.00"
			}, {
				Family: "",
				IsParent: false,				
				LocationCode: "1005",
				Material: "22446",
				Vendor: "909991",
				Description: "MARZETTI LT.SLAW DRESSING",
				valid_from: "5/2/2021",
				valid_to: "12/31/9999",
				Last_Cost: "2.52",
				Margin: "30.15",
				Unit_sell: "3.98",
				Multiplier: "1",
				UPC: "7020031001",
				Color: "#40916C",
				Allowance: "0.00"
			}];

			var selected = data.filter(function (obj) {
				return obj.Material === matnr;
			});
			if (selected.length > 0) {
				this.getView().getModel().setProperty(sPath, selected[0]);
			}

		}
	});
});