using { inventory as db } from '../db/schema';

@path: '/odata/v4/inventory'
@requires: 'authenticated-user'
service InventoryService {

  @restrict: [
    { grant: 'READ',   to: 'authenticated-user' },
    { grant: 'UPDATE', to: ['manager', 'admin'] },
    { grant: 'DELETE', to: 'admin' },
  ]
  entity Products as projection on db.Products;

  @restrict: [
    { grant: 'READ',   to: 'authenticated-user' },
    { grant: 'UPDATE', to: ['manager', 'admin'] },
    { grant: 'DELETE', to: 'admin' },
  ]
  entity Branches as projection on db.Branches;

  @restrict: [
    { grant: 'READ',   to: 'authenticated-user' },
    { grant: 'UPDATE', to: ['manager', 'admin'] },
    { grant: 'DELETE', to: 'admin' },
  ]
  entity Stocks as projection on db.Stocks;

  @restrict: [
    { grant: 'READ',   to: 'authenticated-user' },
    { grant: 'CREATE', to: 'clerk' },
    { grant: 'UPDATE', to: ['clerk', 'manager', 'admin'] },
    { grant: 'DELETE', to: 'admin' },
  ]
  entity StockRequests as projection on db.StockRequests {
    *,
    product.name          as productName          : String(100),
    requestingBranch.name as requestingBranchName : String(100),
    fulfillingBranch.name as fulfillingBranchName : String(100)
  };

}