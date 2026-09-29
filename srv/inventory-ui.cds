using { InventoryService } from './inventory-service';

annotate InventoryService.StockRequests with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Stock Request',
      TypeNamePlural: 'Stock Requests',
      Title: { Value: requestNumber },
      Description: { Value: notes }
    },

    SelectionFields: [
      status,
      priority,
      requestType
    ],

    LineItem: [
      { Value: requestNumber,        Label: 'Request #' },
      { Value: productName,          Label: 'Product' },
      { Value: requestingBranchName, Label: 'Requesting Branch' },
      { Value: fulfillingBranchName, Label: 'Fulfilling Branch' },
      { Value: quantity,             Label: 'Qty' },
      { Value: requestType,          Label: 'Type' },
      { Value: status,               Label: 'Status' },
      { Value: priority,             Label: 'Priority' },
      { Value: estimatedCost,        Label: 'Cost (EUR)' },
      { Value: estimatedCostUSD,     Label: 'Cost (USD)' }
    ],

    FieldGroup #General: {
      Data: [
        { Value: requestNumber },
        { Value: productName },
        { Value: requestingBranchName },
        { Value: fulfillingBranchName },
        { Value: quantity },
        { Value: requestType },
        { Value: status },
        { Value: priority }
      ]
    },

    FieldGroup #Approval: {
      Data: [
        { Value: requestedBy },
        { Value: requestedAt },
        { Value: approvedBy },
        { Value: approvedAt }
      ]
    },

    FieldGroup #Pricing: {
      Data: [
        { Value: estimatedCost },
        { Value: estimatedCostUSD }
      ]
    },

    FieldGroup #Notes: {
      Data: [
        { Value: notes }
      ]
    },

    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'General',  Target: '@UI.FieldGroup#General'  },
      { $Type: 'UI.ReferenceFacet', Label: 'Approval', Target: '@UI.FieldGroup#Approval' },
      { $Type: 'UI.ReferenceFacet', Label: 'Pricing',  Target: '@UI.FieldGroup#Pricing'  },
      { $Type: 'UI.ReferenceFacet', Label: 'Notes',    Target: '@UI.FieldGroup#Notes'    }
    ]
  }
);