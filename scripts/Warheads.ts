import { ethers } from "hardhat";
import { ERC6551Account, ERC6551Registry, WarheadFactory, WarheadNft } from "../typechain-types";
import { Defender } from "@openzeppelin/defender-sdk";
import ERC2771ForwarderArtifact from "@openzeppelin/contracts/build/contracts/ERC2771Forwarder.json";
import type { Signer } from "ethers";

async function main() {
    const creds = {
        relayerApiKey: process.env.RELAYER_API_KEY,
        relayerApiSecret: process.env.RELAYER_API_SECRET,
    };
    const client = new Defender(creds);

    let accounts: string[] = [];
    const signers = await ethers.getSigners();
    for (const signer of signers) {
        accounts.push(await signer.getAddress());
    }
    const ERC6551Account = await ethers.getContractFactory("ERC6551Account");
    const erc6551Account = (await ERC6551Account.deploy()) as ERC6551Account;

    const ERC6551Registry = await ethers.getContractFactory("ERC6551Registry");
    const erc6551Registry = (await ERC6551Registry.deploy()) as ERC6551Registry;

    const WarheadNFTFactory = await ethers.getContractFactory("WarheadNft");
    const warheadNft = (await WarheadNFTFactory.deploy(accounts[0], await erc6551Registry.getAddress(), await erc6551Account.getAddress())) as WarheadNft;

    console.log(`warhead nft deployed at ${await warheadNft.getAddress()}`);

    const provider = client.relaySigner.getProvider();
    const openzeppelinDefenderSigner = await client.relaySigner.getSigner(provider, { speed: 'fast' });

    const ForwarderFactory = new ethers.ContractFactory(ERC2771ForwarderArtifact.abi, ERC2771ForwarderArtifact.bytecode, openzeppelinDefenderSigner as Signer);
    const forwarder = await ForwarderFactory.deploy('ERC2771Forwarder')

    console.log(`forwarder deployed at ${await forwarder.getAddress()}`);

    const WarheadFactory = await ethers.getContractFactory("WarheadFactory");
    const warheadFactory = (await WarheadFactory.deploy(await forwarder.getAddress(), await warheadNft.getAddress())) as WarheadFactory;

    await warheadNft.transferOwnership(await warheadFactory.getAddress());
    console.log(`warhead factory deployed at ${await warheadFactory.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
