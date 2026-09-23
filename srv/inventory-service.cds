using { inventory as db } from '../db/schema';

@path: '/odata/v4/inventory'
service InventoryService {

  @readonly
  entity Products    as projection on db.Products;

  @readonly
  entity Branches    as projection on db.Branches;

  @readonly
  entity Stocks      as projection on db.Stocks;

  entity StockRequests as projection on db.StockRequests;

}