"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";


export async function scrapeStoreProduct(prodUrl: string) {
    if (!prodUrl) return;

    try {
        connectToDB()
        const scrapedProd = await scrapeAmazonProduct(prodUrl)

        if (!scrapedProd) return

        let prod = scrapedProd

        // check in db for the product
        const existingProd = await Product.findOne({url : scrapedProd.url}) 


        if (existingProd) {
            const updatedProdHist: any = [
                ...existingProd.priceHistory,
                {price: scrapedProd.currentPrice}
            ]

            prod = {
                ...scrapedProd,
                priceHistory: updatedProdHist,
                lowestPrice: getLowestPrice(updatedProdHist),
                highestPrice: getHighestPrice(updatedProdHist),
                averagePrice: getAveragePrice(updatedProdHist)
            }
        }

        const newProduct = await Product.findOneAndUpdate(
            {url: scrapedProd.url},
            prod,
            {upsert: true, new: true}
        )
        
        revalidatePath(`/products/${newProduct._id}`)

    } 
    catch (error: any) {
        throw new Error(`Failed to create/update Product : ${error.message}`)
    }
}

export async function getProductById(productId:string)  {

    try{
        connectToDB()

        const product = await Product.findOne({_id: productId})
        if (!product) return null
        return product
    }
    catch(error) {

    }
}

export async function fetchAllProducts() {
    try{
        connectToDB()
        const products = await Product.find()
        return products
    }
    catch(error) {
        console.log(error)
    }
}

export async function fetchSimilarProducts(productId:string) {

    try {
        connectToDB()
        const currentProd = await Product.findById(productId)

        if (!currentProd) return null

        const similarProducts = await Product.find({
            _id : {$ne: productId},
        }).limit(3)

        return similarProducts

    } catch (error) {
        console.log(error)
    }

}