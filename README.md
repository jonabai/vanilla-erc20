# Vanilla ERC20 Token

A "vanilla" ERC20 token implementation in Solidity without external dependencies (no OpenZeppelin). Everything is contained in a single contract file.

## Overview

This project implements a fully compliant ERC20 token from scratch, following the [EIP-20 specification](https://eips.ethereum.org/EIPS/eip-20). It's designed for local testing purposes and as a lightweight alternative when you don't need the full OpenZeppelin library.

## Architecture

### Contract Structure

```
contracts/ERC20Token.sol
├── IERC20           # Standard ERC20 interface
├── IERC20Metadata   # Optional metadata extension (name, symbol, decimals)
└── ERC20Token       # Full implementation
```

### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `_balances` | `mapping(address => uint256)` | Token balance per address |
| `_allowances` | `mapping(address => mapping(address => uint256))` | Approved spending amounts |
| `_totalSupply` | `uint256` | Total tokens in circulation |
| `_name` | `string` | Token name |
| `_symbol` | `string` | Token symbol |

### Public Functions

| Function | Description |
|----------|-------------|
| `name()` | Returns token name |
| `symbol()` | Returns token symbol |
| `decimals()` | Returns decimal places (18) |
| `totalSupply()` | Returns total token supply |
| `balanceOf(address)` | Returns balance of an address |
| `transfer(address, uint256)` | Transfer tokens to address |
| `allowance(address, address)` | Check spending allowance |
| `approve(address, uint256)` | Approve spender allowance |
| `transferFrom(address, address, uint256)` | Transfer on behalf of owner |

### Internal Functions

| Function | Description |
|----------|-------------|
| `_transfer(address, address, uint256)` | Core transfer logic |
| `_update(address, address, uint256)` | Balance update hook (override for custom logic) |
| `_mint(address, uint256)` | Create new tokens |
| `_burn(address, uint256)` | Destroy tokens |
| `_approve(address, address, uint256)` | Set allowance |
| `_spendAllowance(address, address, uint256)` | Deduct from allowance |

### Events

| Event | Description |
|-------|-------------|
| `Transfer(address indexed from, address indexed to, uint256 value)` | Emitted on transfers |
| `Approval(address indexed owner, address indexed spender, uint256 value)` | Emitted on approvals |

## Design Decisions

1. **No Dependencies**: The contract is self-contained without importing OpenZeppelin or other libraries.

2. **18 Decimals**: Standard decimal places matching ETH's wei conversion.

3. **Infinite Allowance**: Setting allowance to `type(uint256).max` creates an infinite approval that doesn't decrease on transfers.

4. **Constructor Minting**: Initial supply is minted to the deployer in the constructor.

5. **Extensibility**: The `_update` function can be overridden to add custom transfer logic (fees, restrictions, etc.).

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd vanilla-erc20

# Install dependencies
npm install
```

## Usage

### Compile

```bash
npm run compile
# or
npx hardhat compile
```

### Test

```bash
npm run test
# or
npx hardhat test
```

### Deploy Locally

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

### Deploy with Custom Parameters

Using Hardhat Ignition:

```bash
npx hardhat ignition deploy ./ignition/modules/ERC20Token.js \
  --parameters '{"name": "CustomToken", "symbol": "CTK", "initialSupply": "5000000000000000000000000"}'
```

### Deploy to Testnet/Mainnet

1. Create `.env` file:
```
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
ALCHEMY_API_KEY=your_alchemy_key
```

2. Update `hardhat.config.js` with network configuration:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

3. Deploy:
```bash
npx hardhat ignition deploy ./ignition/modules/ERC20Token.js --network sepolia
```

## Project Structure

```
vanilla-erc20/
├── contracts/
│   └── ERC20Token.sol       # ERC20 implementation
├── ignition/
│   └── modules/
│       └── ERC20Token.js    # Hardhat Ignition deployment
├── scripts/
│   └── deploy.js            # Traditional deployment script
├── test/
│   └── ERC20Token.js        # Test suite (14 tests)
├── hardhat.config.js        # Hardhat configuration
├── package.json
├── .gitignore
└── README.md
```

## Testing

The test suite covers:

- **Deployment**: Name, symbol, decimals, initial supply
- **Transfers**: Basic transfers, insufficient balance, zero address, events
- **Allowances**: Approve, transferFrom, insufficient allowance, infinite approval

Run tests with coverage:

```bash
npx hardhat coverage
```

## Security Considerations

- **No Reentrancy**: State changes happen before external calls
- **Overflow Protection**: Solidity 0.8+ has built-in overflow checks
- **Zero Address Checks**: Prevents transfers to/from zero address
- **Allowance Race Condition**: Be aware of the approve/transferFrom race condition; consider using increaseAllowance/decreaseAllowance patterns in production

## License

MIT
