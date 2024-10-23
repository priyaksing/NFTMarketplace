import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import ABI from '../NFTMarketplace.json';
import axios from "axios";
import { useState } from "react";
import NFTTile from "./NFTTile";
import { ethers } from "ethers";

export default function Profile() {
    const [data, updateData] = useState([]);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    const [dataFetched, updateFetched] = useState(false);

    async function getNFTData(tokenId) {
        // const ethers = require("ethers");
        let sumPrice = 0;
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(ABI.address, ABI.abi, signer)
        console.log("profile here");
        let latestToken = await contract.getLatestIdToListedToken();
        console.log(latestToken);
        //create an NFT Token
        let transaction = await contract.getMyNFTs()

        /*
        * Below function takes the metadata from tokenURI and the data returned by getMyNFTs() contract function
        * and creates an object of information that is to be displayed
        */

        const items = await Promise.all(transaction.map(async (i) => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let price = ethers.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                tokenId: Number(i.tokenId),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            sumPrice += Number(price);
            return item;

        }))


        updateData(items);
        updateFetched(true);
        updateAddress(addr);
        updateTotalPrice(sumPrice.toPrecision(3));


    }

    const params = useParams();
    const tokenId = params.tokenId;

    // Explicit variable set to limit the data fetching to once
    if (!dataFetched) {
        getNFTData(tokenId);
        console.log(data);
    }

    return (
        <div className="profileClass" style={{ "min-height": "100vh" }}>
            <Navbar></Navbar>
            <div className="profileClass">
                <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                    <div className="mb-5">
                        <h2 className="font-bold">Wallet Address</h2>
                        {address}
                    </div>
                </div>
                <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
                </div>
                <div className="flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="font-bold">Your NFTs</h2>
                    <div className="flex justify-center flex-wrap max-w-screen-xl">
                        {data.map((value, index) => {
                            return <NFTTile data={value} key={index}></NFTTile>;
                        })}
                    </div>
                    <div className="mt-10 text-xl bg-white px-3 py-2 text-indigo-400 font-bold rounded-md">
                        {data.length == 0 ? "Oops, No NFT data to display (Are you logged in?)" : ""}
                    </div>
                </div>
            </div>
        </div>
    )
};