<script>
    import { ethers } from "ethers";
    import axios from "axios";
    import Web3Modal from "web3modal";

    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    import NFTMarketplace from "../../hardhat/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
    let nfts = [];
    let x = [];
    let loadingState = "not-loaded";

    async function loadNFTs() {
        const provider = new ethers.providers.JsonRpcProvider();
        const contract = new ethers.Contract(
            marketplaceAddress,
            NFTMarketplace.abi,
            provider
        );
        const data = await contract.fetchMarketItems();
        console.log(data);

        /*
         *  map over items returned from smart contract and format
         *  them as well as fetch their token metadata
         */
        const items = await Promise.all(
            data.map(async (i) => {
                const tokenUri = await contract.tokenURI(i.tokenId);
                const meta = await axios.get(tokenUri);
                let price = ethers.utils.formatUnits(
                    i.price.toString(),
                    "ether"
                );
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.data.image,
                    name: meta.data.name,
                    description: meta.data.description,
                };
                return item;
            })
        );

        x = items;
        console.log(x);
        loadingState = "loaded";
    }
    loadNFTs();

    async function buyNft(nft) {
        /* needs the user to sign the transaction, so will use Web3Provider and sign it */
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            marketplaceAddress,
            NFTMarketplace.abi,
            signer
        );

        /* user will be prompted to pay the asking proces to complete the transaction */
        const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
        console.log(price);
        const transaction = await contract.createMarketSale(nft.tokenId, {
            value: price,
        });
        await transaction.wait();
        loadNFTs();
    }
</script>

<div class="headline"><h1>Homepage | NFT Marketplace</h1></div>
<div class="menu">
    <ul>
        <li><a href="#home">home</a></li>
        <li><a href="#sell">Sell</a></li>
        <li><a href="#collection">collection</a></li>
        <li><a href="#Dashboard">Dashboard</a></li>
    </ul>
</div>

{#if loadingState === "loaded" && !nfts.length}
    <p>No items in your marketplace ...</p>
    <ul>
        {#each x as item}
            <li>{item.name} {item.price} {item.seller}</li>
            <button on:click={buyNft(item)}>Buy me</button>
        {/each}
    </ul>
{:else}{/if}

<style>
    .headline {
        font-size: 15px;
    }
    .menu {
        padding-top: 10px;
        background-color: rgb(218, 218, 218);
        overflow: hidden;
    }
    .menu ul {
        font-size: 20px;
        text-transform: uppercase;
    }
</style>
