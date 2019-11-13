'use strict';

const BaseService = require('./Base');
class PpoHdService extends BaseService {

  constructor(app) {
    super(app);
    this.tableName = 'ESCMOWNER.PPO_HD';
  }

}

module.exports = PpoHdService;
