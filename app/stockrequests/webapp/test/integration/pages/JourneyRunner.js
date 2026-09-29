sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"stockrequests/test/integration/pages/StockRequestsList.gen",
	"stockrequests/test/integration/pages/StockRequestsObjectPage.gen"
], function (JourneyRunner, StockRequestsListGenerated, StockRequestsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('stockrequests') + '/test/flp.html#app-preview',
        pages: {
			onTheStockRequestsListGenerated: StockRequestsListGenerated,
			onTheStockRequestsObjectPageGenerated: StockRequestsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

