import Product from "@/lib/models/product.model"
import { connectToDB } from "@/lib/mongoose"
import { scrapeAmazonProduct } from "@/lib/scraper"
import { getAveragePrice, getHighestPrice, getLowestPrice } from "@/lib/utils"
import { NextResponse } from "next/server"

export const maxDuration = 300
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        connectToDB()

        const products = await Product.find({})

        if(!products) throw new Error(`No Products Found`)

        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {
                const scrapedProd = await scrapeAmazonProduct(currentProduct.url)
                if (!scrapedProd) throw new Error('No product found')

                const updatedProdHist: any = [
                    ...currentProduct.priceHistory,
                    {price: scrapedProd.currentPrice}
                ]
    
                const prod = {
                    ...scrapedProd,
                    priceHistory: updatedProdHist,
                    lowestPrice: getLowestPrice(updatedProdHist),
                    highestPrice: getHighestPrice(updatedProdHist),
                    averagePrice: getAveragePrice(updatedProdHist)
                }    
                
                const updatedProd = await Product.findOneAndUpdate(
                    {url: prod.url},
                    prod
                )
                
                return updatedProd
            })
        )
        return NextResponse.json({
            message: 'Ok', data: updatedProducts 
        })

    } catch (error) {
        throw new Error(`Error in Get : ${error}`)
    }
}