<script>
    import { ethers } from "ethers";
    import Web3Modal from "web3modal";
    import { NFTStorage, File, Blob } from "nft.storage";
    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    import axios from "axios";
    import NFTMarketplace  from "../../../hardhat/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
    // The 'mime' npm package helps us set the correct file type on our File objects
    import mime from "mime";
    const NFT_STORAGE_TOKEN =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDI5YkREOUEyYmU3ZDAzNzk4ODJBNUVBMGQzZjQ0OTAzZjFEOThiQzgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0NTM1NDEyNjIwMSwibmFtZSI6Im5mdCJ9.mw6Q9R45DovsR_--xt5TnDbU47r16O-2PZR737ZbhFg";
    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
    let file = null;
    let ipfsFileUrl = null;
    let fields = {
        title: "",
        description: "",
        price: "",
    };
    $: console.log(fields.price);

    async function onChange(e) {
        file = e.target.files[0];
        const imageFile = new File([file], file.name, {
            type: "image/*",
        });
        console.log(imageFile);
        // const metadata = await client.store({
        //     name: "My sweet NFT",
        //     description: "Just try to funge it. You can't do it.",
        //     image: imageFile,
        // });
        // ipfsFileUrl = `https://cloudflare-ipfs.com/ipfs/${metadata.ipnft}/metadata.json`;
    }

    async function listNFTForSale() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        /* next, create the item */
        let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer);
        let transaction = await contract.createToken(
            "https://cloudflare-ipfs.com/ipfs/bafyreibtzhbq5cdi7ztklflha63ardp6zfvt67lv2pngldoqbemeenih2q/metadata.json"
        );
        let tx = await transaction.wait();
        let event = tx.events[0];
        let value = event.args[2];
        let tokenId = value.toNumber();
        console.log(tokenId);

        const tokenUri = await contract.tokenURI(tokenId);
        const meta = await axios.get(tokenUri);
        console.log(meta);
        return console.log(tokenId);
    }
</script>

<label for="tilte">Title:</label>
<input bind:value={fields.title} type="text" id="tilte" name="tilte" /><br /><br
/>
<label for="price">Description:</label>
<input bind:value={fields.description} type="text" id="price" name="price" /><br
/><br />
<label for="desc">Price:</label>
<input bind:value={fields.price} type="text" id="desc" name="desc" /><br /><br
/>

<label for="file">Image:</label>
<input on:input={onChange} type="file" id="file" name="file" /><br /><br />
{fields.price}

<input on:click={listNFTForSale} type="submit" value="Create Token" />
