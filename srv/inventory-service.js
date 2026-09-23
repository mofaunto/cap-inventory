import cds from '@sap/cds';

export default class InventoryService extends cds.ApplicationService {

  async init() {
    const { StockRequests } = this.entities;

    this.before('CREATE', StockRequests, (req) => this.validateStockRequest(req));
    this.before('UPDATE', StockRequests, (req) => {
      if (req.data.quantity !== undefined && req.data.quantity <= 0) {
        return req.reject(400, 'Quantity must be greater than zero.');
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
}