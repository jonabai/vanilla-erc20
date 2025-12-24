const { expect } = require("chai");
const hre = require("hardhat");

describe("ERC20Token", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  const NAME = "MyToken";
  const SYMBOL = "MTK";
  const INITIAL_SUPPLY = hre.ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    token = await hre.ethers.deployContract("ERC20Token", [
      NAME,
      SYMBOL,
      INITIAL_SUPPLY,
    ]);
  });

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      expect(await token.name()).to.equal(NAME);
    });

    it("Should set the right symbol", async function () {
      expect(await token.symbol()).to.equal(SYMBOL);
    });

    it("Should set the right decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct initial supply", async function () {
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = hre.ethers.parseEther("100");

      await token.transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);

      await token.connect(addr1).transfer(addr2.address, amount);
      expect(await token.balanceOf(addr2.address)).to.equal(amount);
      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should fail when transferring to zero address", async function () {
      await expect(
        token.transfer(hre.ethers.ZeroAddress, 100)
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("Should emit Transfer event", async function () {
      const amount = hre.ethers.parseEther("100");

      await expect(token.transfer(addr1.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, amount);
    });
  });

  describe("Allowances", function () {
    it("Should approve tokens for delegated transfer", async function () {
      const amount = hre.ethers.parseEther("100");

      await token.approve(addr1.address, amount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(amount);
    });

    it("Should emit Approval event", async function () {
      const amount = hre.ethers.parseEther("100");

      await expect(token.approve(addr1.address, amount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("Should transfer tokens using transferFrom", async function () {
      const amount = hre.ethers.parseEther("100");

      await token.approve(addr1.address, amount);
      await token.connect(addr1).transferFrom(owner.address, addr2.address, amount);

      expect(await token.balanceOf(addr2.address)).to.equal(amount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(0);
    });

    it("Should fail transferFrom if allowance is insufficient", async function () {
      const amount = hre.ethers.parseEther("100");

      await token.approve(addr1.address, amount);

      await expect(
        token.connect(addr1).transferFrom(owner.address, addr2.address, amount + 1n)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should not decrease allowance if set to max uint256", async function () {
      const maxUint256 = hre.ethers.MaxUint256;
      const amount = hre.ethers.parseEther("100");

      await token.approve(addr1.address, maxUint256);
      await token.connect(addr1).transferFrom(owner.address, addr2.address, amount);

      expect(await token.allowance(owner.address, addr1.address)).to.equal(maxUint256);
    });
  });

  describe("Ownership", function () {
    it("Should set deployer as owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should emit OwnershipTransferred on deployment", async function () {
      const deployTx = await hre.ethers.deployContract("ERC20Token", [
        NAME,
        SYMBOL,
        INITIAL_SUPPLY,
      ]);

      await expect(deployTx.deploymentTransaction())
        .to.emit(deployTx, "OwnershipTransferred")
        .withArgs(hre.ethers.ZeroAddress, owner.address);
    });

    it("Should transfer ownership", async function () {
      await expect(token.transferOwnership(addr1.address))
        .to.emit(token, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);

      expect(await token.owner()).to.equal(addr1.address);
    });

    it("Should fail to transfer ownership if not owner", async function () {
      await expect(token.connect(addr1).transferOwnership(addr2.address))
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("Should fail to transfer ownership to zero address", async function () {
      await expect(token.transferOwnership(hre.ethers.ZeroAddress))
        .to.be.revertedWithCustomError(token, "OwnableInvalidOwner")
        .withArgs(hre.ethers.ZeroAddress);
    });

    it("Should renounce ownership", async function () {
      await expect(token.renounceOwnership())
        .to.emit(token, "OwnershipTransferred")
        .withArgs(owner.address, hre.ethers.ZeroAddress);

      expect(await token.owner()).to.equal(hre.ethers.ZeroAddress);
    });

    it("Should fail to renounce ownership if not owner", async function () {
      await expect(token.connect(addr1).renounceOwnership())
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = hre.ethers.parseEther("1000");
      const initialBalance = await token.balanceOf(addr1.address);

      await expect(token.mint(addr1.address, mintAmount))
        .to.emit(token, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, addr1.address, mintAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(initialBalance + mintAmount);
    });

    it("Should increase total supply when minting", async function () {
      const mintAmount = hre.ethers.parseEther("1000");
      const initialSupply = await token.totalSupply();

      await token.mint(addr1.address, mintAmount);

      expect(await token.totalSupply()).to.equal(initialSupply + mintAmount);
    });

    it("Should fail to mint if not owner", async function () {
      const mintAmount = hre.ethers.parseEther("1000");

      await expect(token.connect(addr1).mint(addr2.address, mintAmount))
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("Should fail to mint to zero address", async function () {
      const mintAmount = hre.ethers.parseEther("1000");

      await expect(token.mint(hre.ethers.ZeroAddress, mintAmount))
        .to.be.revertedWith("ERC20: mint to the zero address");
    });
  });

  describe("Burning", function () {
    it("Should allow owner to burn tokens", async function () {
      const burnAmount = hre.ethers.parseEther("1000");
      const initialBalance = await token.balanceOf(owner.address);

      await expect(token.burn(owner.address, burnAmount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, hre.ethers.ZeroAddress, burnAmount);

      expect(await token.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
    });

    it("Should decrease total supply when burning", async function () {
      const burnAmount = hre.ethers.parseEther("1000");
      const initialSupply = await token.totalSupply();

      await token.burn(owner.address, burnAmount);

      expect(await token.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should fail to burn if not owner", async function () {
      const burnAmount = hre.ethers.parseEther("1000");

      await expect(token.connect(addr1).burn(owner.address, burnAmount))
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("Should fail to burn from zero address", async function () {
      const burnAmount = hre.ethers.parseEther("1000");

      await expect(token.burn(hre.ethers.ZeroAddress, burnAmount))
        .to.be.revertedWith("ERC20: burn from the zero address");
    });

    it("Should fail to burn more than balance", async function () {
      const balance = await token.balanceOf(addr1.address);
      const burnAmount = balance + 1n;

      await expect(token.burn(addr1.address, burnAmount))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });
});
