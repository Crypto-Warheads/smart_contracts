import type { Signer } from "ethers";
import { ERC6551Account, ERC6551Registry, WarheadFactory, WarheadNft } from "../typechain-types";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Warhead Factory", function () {
    const accounts: string[] = [];
    let signers: Signer[];
    let warheadNft: WarheadNft;
    let warheadFactory: WarheadFactory;

    before(async () => {
        signers = await ethers.getSigners();
        for (const signer of signers) {
            accounts.push(await signer.getAddress());
        }

        const ERC6551Account = await ethers.getContractFactory("ERC6551Account");
        const erc6551Account = (await ERC6551Account.deploy()) as ERC6551Account;

        const ERC6551Registry = await ethers.getContractFactory("ERC6551Registry");
        const erc6551Registry = (await ERC6551Registry.deploy()) as ERC6551Registry;

        const WarheadNFTFactory = await ethers.getContractFactory("WarheadNft");
        warheadNft = (await WarheadNFTFactory.deploy(accounts[0], await erc6551Registry.getAddress(), await erc6551Account.getAddress())) as WarheadNft;

        const WarheadFactory = await ethers.getContractFactory("WarheadFactory");
        warheadFactory = (await WarheadFactory.deploy(ethers.ZeroAddress, await warheadNft.getAddress())) as WarheadFactory;
    });

    it("Should not create a warhead nft if the warhead factory is not the owner", async function () {
        await expect(warheadFactory.createWarhead(ethers.ZeroAddress)).to.be.revertedWithCustomError(warheadNft, "OwnableUnauthorizedAccount");
    });

    it("Should transfer the ownership of the warhead nft to the warhead factory", async function () {
        await warheadNft.transferOwnership(await warheadFactory.getAddress());
        expect(await warheadNft.owner()).to.equal(await warheadFactory.getAddress());
    });

    it("Should create a warhead nft", async function () {
        await warheadFactory.createWarhead(ethers.ZeroAddress);
        expect(await warheadNft.ownerOf(0)).to.equal(await warheadFactory.getAddress());
        const warhead = await warheadFactory.fetchWarheadInfo(0);
        expect(warhead.dropper).to.be.equal(accounts[0]);
    });

    it("Should transfer some money to the warhead nft's wallet", async function () {
        const warheadAddress = await warheadNft.getWarheadAddress(0);
        await signers[0].sendTransaction({ to: warheadAddress, value: ethers.parseEther("1") });
        expect(await ethers.provider.getBalance(warheadAddress)).to.be.equal(ethers.parseEther("1"));
    });

    it("Should not drop the warhead if the caller is not the dropper", async function () {
        const now = Math.floor(Date.now() / 1000);

        await expect(warheadFactory.connect(signers[1]).dropWarhead(0, { lat: 1000000, long: 1000000 }, now + 10 * 60)).to.be.rejectedWith("Cannot drop someone else's warhead");
    });

    it("Should not claim the warhead not launched", async function () {
        await expect(warheadFactory.claim({ lat: 1000000, long: 1000000 }, 0)).to.be.revertedWith("Warhead is not yet launched");
    });

    it("Should drop the warhead", async function () {
        const now = Math.floor(Date.now() / 1000);

        await warheadFactory.dropWarhead(0, { lat: 1000000, long: 1000000 }, now + 10 * 60);
    });

    it("Should not claim the warhead not dropped", async function () {
        await expect(warheadFactory.connect(signers[1]).claim({ lat: 1000000, long: 1000000 }, 0)).to.be.revertedWith("Warhead has not landed yet");
    });

    it("Should increase the time on the hardhat", async () => {
        await ethers.provider.send("evm_increaseTime", [11 * 60]);
    });

    it("Should not claim the warhead if you are the dropper", async function () {
        await expect(warheadFactory.claim({ lat: 1000000, long: 1000000 }, 0)).to.be.revertedWith("Cannot claim your own warhead");
    });

    it("Should not claim the warhead if you are away from the drop", async function () {
        await expect(warheadFactory.connect(signers[1]).claim({ lat: 1000000, long: 1000500 }, 0)).to.be.revertedWith("Location is too far from target");
    });

    it("Should claim the warhead", async function () {
        await warheadFactory.connect(signers[1]).claim({ lat: 1000000, long: 1000300 }, 0);
        expect(await warheadNft.ownerOf(0)).to.be.equal(accounts[1]);
    });

    it("Should not claim the warhead if already claimed", async function () {
        await expect(warheadFactory.connect(signers[2]).claim({ lat: 1000000, long: 1000300 }, 0)).to.be.revertedWith("Warhead is already claimed");
    });

    it("Should be able to withdraw the money from the drop", async function () {
        const warheadAddress = await warheadNft.getWarheadAddress(0);
        const balanceBefore = await ethers.provider.getBalance(warheadAddress);
        const ERC6551Account = await ethers.getContractFactory("ERC6551Account");
        const erc6551Account = ERC6551Account.attach(warheadAddress) as ERC6551Account;
        await erc6551Account.connect(signers[1]).executeCall(accounts[1], ethers.parseEther("1"), "0x");
        const balanceAfter = await ethers.provider.getBalance(warheadAddress);
        expect(balanceBefore - balanceAfter).to.be.equal(ethers.parseEther("1"));
    });
});