<script>
    import { ethers } from "ethers";
    import axios from "axios";
    import Web3Modal from "web3modal";

    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    import NFTMarketplace from "../../../hardhat/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

    let nfts = [];
    let x = [];
    let reSellPrice = "0"
    let loadingState = "not-loaded";

    async function loadNFTs() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const marketplaceContract = new ethers.Contract(
            marketplaceAddress,
            NFTMarketplace.abi,
            signer
        );
        const data = await marketplaceContract.fetchMyNFTs();

        const items = await Promise.all(
            data.map(async (i) => {
                const tokenURI = await marketplaceContract.tokenURI(i.tokenId);
                const meta = await axios.get(tokenURI);
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
                    tokenURI,
                };
                return item;
            })
        );
        nfts = items;
        loadingState = "loaded";
        console.log(items);
    }

    async function reSell(nft) {
        if (reSellPrice === "0") return console.log("should not be 0")
        const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const priceFormatted = ethers.utils.parseUnits(reSellPrice, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(nft.tokenId, priceFormatted, { value: listingPrice })
    let x = await transaction.wait()
    console.log(x)
    }
</script>

{#if loadingState === "loaded" && nfts.length === 0}
    <p>No items in your marketplace ...</p>
{:else}
    {#each nfts as nft, i}
        <li>owner: {nft.owner} <br /> price: {nft.price}</li>
        <li>
            <button on:click={reSell(nft)}> Resell </button>
            <label for="desc">ReSell Price:</label>

            <input
                bind:value={reSellPrice}
                type="text"
                id="desc"
                name="desc"
            /><br /><br />
        </li>
    {/each}
{/if}

<button on:click={loadNFTs}> Click to load the purchased nfts </button>
