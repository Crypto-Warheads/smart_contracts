import type { Signer } from "ethers";
import { ethers } from "hardhat";
import { ERC6551Account, ERC6551Registry, WarheadNft } from "../typechain-types";
import { expect } from "chai";

describe("Warhead NFT", function () {
    const accounts: string[] = [];
    let signers: Signer[];
    let warheadNft: WarheadNft;

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
    });

    it("Should return the owner", async function () {
        expect(await warheadNft.owner()).to.equal(accounts[0]);
    });

    it("Should mint some nfts to the users", async function () {
        await warheadNft.assembleWarhead(accounts[1], 0);
        await warheadNft.assembleWarhead(accounts[2], 1);
        await warheadNft.assembleWarhead(accounts[3], 2);
        await warheadNft.assembleWarhead(accounts[1], 3);
        await warheadNft.assembleWarhead(accounts[2], 4);
    });

    it("Should have the wallets and the owners should be the same as the nfts", async function () {
        const ERC6551Account = await ethers.getContractFactory("ERC6551Account");

        const nftAccountAddress0 = await warheadNft.getWarheadAddress(0);
        const erc6551Account0 = (ERC6551Account.attach(nftAccountAddress0)) as ERC6551Account;
        expect(await erc6551Account0.owner()).to.be.equal(accounts[1]);

        const nftAccountAddress1 = await warheadNft.getWarheadAddress(1);
        const erc6551Account1 = (ERC6551Account.attach(nftAccountAddress1)) as ERC6551Account;
        expect(await erc6551Account1.owner()).to.be.equal(accounts[2]);

        const nftAccountAddress2 = await warheadNft.getWarheadAddress(2);
        const erc6551Account2 = (ERC6551Account.attach(nftAccountAddress2)) as ERC6551Account;
        expect(await erc6551Account2.owner()).to.be.equal(accounts[3]);

        const nftAccountAddress3 = await warheadNft.getWarheadAddress(3);
        const erc6551Account3 = (ERC6551Account.attach(nftAccountAddress3)) as ERC6551Account;
        expect(await erc6551Account3.owner()).to.be.equal(accounts[1]);

        const nftAccountAddress4 = await warheadNft.getWarheadAddress(4);
        const erc6551Account4 = (ERC6551Account.attach(nftAccountAddress4)) as ERC6551Account;
        expect(await erc6551Account4.owner()).to.be.equal(accounts[2]);
    });
});
