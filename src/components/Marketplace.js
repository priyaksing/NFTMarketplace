import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import ABI from '../NFTMarketplace.json';
import { ethers } from "ethers";

export default function Marketplace() {

    const [data, updateData] = useState(null);
    const [dataFetched, updateFetched] = useState(false);

    async function getAllNFTs() {

        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        //Pull the deployed contract instance
        let contract = new ethers.Contract(ABI.address, ABI.abi, signer)
        //create an NFT Token
        let transaction = await contract.getAllNFTs()

        //Fetch all the details of every NFT from the contract and display
        const items = await Promise.all(transaction.map(async i => {
            var tokenURI = await contract.tokenURI(i.tokenId);
            console.log("getting this tokenUri", tokenURI);
            tokenURI = GetIpfsUrlFromPinata(tokenURI);
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
            return item;
        }))

        updateFetched(true);
        updateData(items);
    }

    if (!dataFetched)
        getAllNFTs();

    return (
        <div>
            <Navbar></Navbar>
            <div className="flex flex-col place-items-center mt-20">
                <div className="md:text-xl font-bold text-white">
                    Top NFTs
                </div>
                <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                    {dataFetched ?
                        (data.map((value, index) => {
                            return <NFTTile data={value} key={index}></NFTTile>;
                        })) : (
                            <div className="bg-white px-3 py-2 text-indigo-400 font-bold rounded-md">
                                No NFTs Listed Yet!
                            </div>
                        )

                    }
                </div>
            </div>
        </div>
    );

}