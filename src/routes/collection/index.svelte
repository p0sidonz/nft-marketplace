<script>
    import { ethers } from "ethers";
    import axios from "axios";
    import Web3Modal from "web3modal";

    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    import NFTMarketplace from "../../../hardhat/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

    //Data
    let nft = [];
    let tokenid = 1;
    let loadingState = "not-loaded";

    async function loadNFTs() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        let contract = new ethers.Contract(
            marketplaceAddress,
            NFTMarketplace.abi,
            signer
        );
        // let listingPrice = await contract.getListingPrice();
        let p = "1";
        const price = ethers.utils.parseUnits(p, "ether");
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();
        let transaction = await contract.createMarketItem(tokenid, price, {
            value: listingPrice,
        });
        console.log(transaction);
        let x = await transaction.wait();
        console.log(x);
    }
</script>

<button on:click={loadNFTs}> mint {tokenid} token</button>
{loadingState}
