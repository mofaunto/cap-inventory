import cds from '@sap/cds';

const ALLOWED_TRANSITIONS = {
  DRAFT:     ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED:  ['FULFILLED'],
  REJECTED:  [],
  FULFILLED: [],
};

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

      const existing = await SELECT.one.from(req.subject);
      if (!existing) return req.reject(404, 'Stock request not found.');

      const merged = { ...existing, ...req.data };

      const relevant = ['quantity', 'product_ID', 'requestingBranch_ID'];
      if (relevant.some((f) => req.data[f] !== undefined)) {
        Object.assign(req.data, await this.computeDerivedFields(merged));
      }

      if (req.data.status !== undefined && req.data.status !== existing.status) {
        await this.handleStatusTransition(req, existing, merged);
      }
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

  async handleStatusTransition(req, existing, merged) {
    const from = existing.status;
    const to = req.data.status;

    if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
      return req.reject(409, `Invalid status transition: ${from} -> ${to}.`);
    }

    if (to === 'APPROVED') {
      req.data.approvedAt = new Date().toISOString();
    }

    if (to === 'FULFILLED') {
      await this.applyFulfillment(req, merged);
    }
  }

  async applyFulfillment(req, { requestType, product_ID, requestingBranch_ID, fulfillingBranch_ID, quantity }) {
    if (requestType === 'TRANSFER') {
      const source = await SELECT.one
        .from('inventory.Stocks')
        .where({ product_ID, branch_ID: fulfillingBranch_ID });

      if (!source || source.quantityOnHand < quantity) {
        const available = source?.quantityOnHand ?? 0;
        return req.reject(409,
          `Insufficient stock at fulfilling branch. Available: ${available}, needed: ${quantity}.`);
      }

      await UPDATE('inventory.Stocks')
        .set({ quantityOnHand: source.quantityOnHand - quantity })
        .where({ ID: source.ID });
    }

    const target = await SELECT.one
      .from('inventory.Stocks')
      .where({ product_ID, branch_ID: requestingBranch_ID });

    if (target) {
      await UPDATE('inventory.Stocks')
        .set({ quantityOnHand: target.quantityOnHand + quantity })
        .where({ ID: target.ID });
    } else {
      const maxRow = await SELECT.one`max(ID) as maxID`.from('inventory.Stocks');
      const newID = (maxRow?.maxID ?? 0) + 1;
      await INSERT.into('inventory.Stocks').entries({
        ID: newID,
        product_ID,
        branch_ID: requestingBranch_ID,
        quantityOnHand: quantity,
        quantityReserved: 0,
        reorderLevel: 0,
        status: 'OK',
      });
    }
  }
}