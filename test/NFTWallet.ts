import { Signer } from "ethers";
import { ethers } from "hardhat";

describe("NFT Wallet", function () {
    const accounts: string[] = [];
    let signers: Signer[];

    before(async () => {
        signers = await ethers.getSigners();
        for (const signer of signers) {
            accounts.push(await signer.getAddress());
        }

    });

});
