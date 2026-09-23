import cds from '@sap/cds';

export default class InventoryService extends cds.ApplicationService {

  async init() {
    const { StockRequests } = this.entities;

    this.before('CREATE', StockRequests, async (req) => {
      this.validateStockRequest(req);
      Object.assign(req.data, await this.computeDerivedFields(req.data));
    });

    this.before('UPDATE', StockRequests, async (req) => {
      if (req.data.quantity !== undefined && req.data.quantity <= 0) {
        return req.reject(400, 'Quantity must be greater than zero.');
      }

      const relevant = ['quantity', 'product_ID', 'requestingBranch_ID'];
      const changed = relevant.some((f) => req.data[f] !== undefined);
      if (!changed) return;

      const existing = await SELECT.one.from(req.subject);
      const merged = { ...existing, ...req.data };
      Object.assign(req.data, await this.computeDerivedFields(merged));
    });

    return super.init();
  }

  validateStockRequest(req) {
    const { quantity, requestType, requestingBranch_ID, fulfillingBranch_ID } = req.data;

    if (quantity == null || quantity <= 0) {
      return req.reject(400, 'Quantity must be greater than zero.');
    }

    if (!['RENEW', 'TRANSFER'].includes(requestType)) {
      return req.reject(400, 'Request type must be RENEW or TRANSFER.');
    }

    if (!requestingBranch_ID) {
      return req.reject(400, 'Requesting branch is required.');
    }

    if (requestType === 'TRANSFER') {
      if (!fulfillingBranch_ID) {
        return req.reject(400, 'Fulfilling branch is required for TRANSFER requests.');
      }
      if (fulfillingBranch_ID === requestingBranch_ID) {
        return req.reject(400, 'Fulfilling branch must be different from requesting branch.');
      }
    }
  }

  async computeDerivedFields({ product_ID, requestingBranch_ID, quantity }) {
    const result = {};

    if (product_ID != null && quantity != null) {
      const product = await SELECT.one.from('inventory.Products').where({ ID: product_ID });
      if (product) {
        result.estimatedCost = Number((quantity * product.unitPrice).toFixed(2));
      }
    }

    if (product_ID != null && requestingBranch_ID != null) {
      const stock = await SELECT.one
        .from('inventory.Stocks')
        .where({ product_ID, branch_ID: requestingBranch_ID });

      if (!stock || stock.quantityOnHand < stock.reorderLevel * 0.25) {
        result.priority = 'HIGH';
      } else if (stock.quantityOnHand < stock.reorderLevel) {
        result.priority = 'MEDIUM';
      } else {
        result.priority = 'LOW';
      }
    }

    return result;
  }
}