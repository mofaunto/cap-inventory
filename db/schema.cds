using { managed } from '@sap/cds/common';

namespace inventory;

@assert.unique: { code: [code] }
entity Branches : managed {
  key ID          : Integer;
      code        : String(10);
      name        : String(100);
      city        : String(50);
      country     : String(50);
      managerEmail: String(100);

      stocks      : Association to many Stocks on stocks.branch = $self;
}

@assert.unique: { sku: [sku] }
entity Products : managed {
  key ID          : Integer;
      sku         : String(20);
      name        : String(100);
      category    : String(50);
      unit        : String(10);
      unitPrice   : Decimal(10,2);
      reorderLevel: Integer;
      active      : Boolean   default true;

      stocks      : Association to many Stocks on stocks.product = $self;
}

entity Stocks : managed {
  key ID              : Integer;
      product         : Association to Products;
      branch          : Association to Branches;
      quantityOnHand  : Integer;
      quantityReserved: Integer  default 0;
      reorderLevel    : Integer;
      lastCountedAt   : Date;
      status          : String(20);
}

@assert.unique: { requestNumber: [requestNumber] }
entity StockRequests : managed {
  key ID               : Integer;
      requestNumber    : String(20);
      product          : Association to Products;
      requestingBranch : Association to Branches;
      fulfillingBranch : Association to Branches;
      quantity         : Integer;
      requestType      : String(20);   //either renew and get new stock or request transfer from other branch
      status           : String(20) default 'DRAFT';
      priority         : String(10);
      requestedBy      : String(100);
      requestedAt      : DateTime;
      approvedBy       : String(100);
      approvedAt       : DateTime;
      notes            : String(500);
      estimatedCost    : Decimal(10,2);
      estimatedCostUSD : Decimal(10,2);
}