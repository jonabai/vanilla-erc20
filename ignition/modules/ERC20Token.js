const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ERC20TokenModule = buildModule("ERC20TokenModule", (m) => {
  // Default parameters - can be overridden at deployment time
  const name = m.getParameter("name", "MyToken");
  const symbol = m.getParameter("symbol", "MTK");
  const initialSupply = m.getParameter("initialSupply", 1000000n * 10n ** 18n); // 1 million tokens with 18 decimals

  const token = m.contract("ERC20Token", [name, symbol, initialSupply]);

  return { token };
});

module.exports = ERC20TokenModule;
