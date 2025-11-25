const getEmployeePosition = require("./get-employee-position.repository");
const {
  getCorpuManagerByGroupMasterIdRepository,
  getGroupMasterByUserIdRepository,
  getTier1ForCabangAnperNonCluster,
} = require("./get-group-master-manager.repository");
const {
  getWalletAdminDataByEmployeeId,
} = require("./get-wallet-admin.repository");

module.exports = {
  getEmployeePosition,
  getCorpuManagerByGroupMasterIdRepository,
  getGroupMasterByUserIdRepository,
  getWalletAdminDataByEmployeeId,
  getTier1ForCabangAnperNonCluster
};
