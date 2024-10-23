import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import ABI from '../NFTMarketplace.json';
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { ethers } from "ethers";

export default function NFTPage(props) {

    const [data, updateData] = useState({});
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("0x");
    const [dataFetched, updateDataFetched] = useState(false);

    async function getNFTData(tokenId) {

        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(ABI.address, ABI.abi, signer)

        //create an NFT Token
        var tokenURI = await contract.tokenURI(tokenId);
        const listedToken = await contract.getListedTokenById(tokenId);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let meta = await axios.get(tokenURI);
        meta = meta.data;
        console.log(listedToken);

        let item = {
            price: meta.price,
            tokenId: tokenId,
            seller: listedToken.seller,
            owner: listedToken.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
        }
        console.log(item);
        updateData(item);
        updateDataFetched(true);
        console.log("address", addr)
        updateCurrAddress(addr);
    }

    async function buyNFT(tokenId) {
        try {
            const ethers = require("ethers");
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            //Pull the deployed contract instance
            let contract = new ethers.Contract(ABI.address, ABI.abi, signer);
            const salePrice = ethers.parseUnits(data.price, 'ether')
            updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")

            //run the executeSale function
            let transaction = await contract.executeSale(tokenId, { value: salePrice });
            await transaction.wait();

            alert('You successfully bought the NFT!');
            updateMessage("");
        }
        catch (e) {
            alert("Upload Error", e)
        }
    }

    const params = useParams();
    const tokenId = params.tokenId;

    if (!dataFetched)
        getNFTData(tokenId);

    if (typeof data.image == "string")
        data.image = GetIpfsUrlFromPinata(data.image);


    return (
        <div style={{ "min-height": "100vh" }}>
            <Navbar></Navbar>
            <div className="flex ml-20 mt-20">
                <img src={data.image} className="w-2/5" />

                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span className="">{data.price + " ETH"}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                        {currAddress != data.owner && currAddress != data.seller ? (
                            <button
                                className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                onClick={() => buyNFT(tokenId)}>
                                Buy this NFT
                            </button>
                        ) : (
                            <div className="text-emerald-700">
                                You are the owner of this NFT
                            </div>
                        )
                        }

                        <div className="text-green text-center mt-3">
                            {message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}