# Inventory & Warehouse System

SAP CAP backend, simple List Fiori.

## Run

    npm install
    npx cds watch

Backend: http://localhost:4004/odata/v4/inventory
Fiori app: http://localhost:4004/stockrequests/index.html

Login with any of:

    clerk@test.com    / pass    (create and view own requests) - Only view in the UI
    manager@test.com  / pass    (view all, approve, reject, fulfill) - Only in API at the moment, no UI
    admin@test.com    / pass    (full access) - Only in API at the moment, no UI

## Entities

- Products   — catalog
- Branches   — warehouses
- Stocks     — quantity on hand per product per branch
- StockRequests — replenishment requests with an approval workflow

## Business logic

- Validates request fields on create and update
- Computes priority from the requesting branch's stock level
- Computes estimated cost in EUR and USD (live rate from Frankfurter API)
- Enforces status transitions: DRAFT → SUBMITTED → APPROVED/REJECTED → FULFILLED
- Adjusts stock quantities when a request is fulfilled

## Roles

- clerk: read products/branches/stocks, create and edit own draft requests (API level only)
- manager: read everything, update requests, approve/reject/fulfill (API level only)
- admin: full access including delete (API level only)