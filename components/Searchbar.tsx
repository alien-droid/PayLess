"use client"
import { scrapeStoreProduct } from '@/lib/actions'
import {useState} from 'react'

const isValidAmazonLink = (url: string) => {
  try {
    const parsedUrl = new URL(url)
    const hostName = parsedUrl.hostname

    return (hostName.includes('amazon.com') || hostName.includes('amazon') || hostName.endsWith('amazon')) 
  }
  catch (error) {
    return false
  }
  return false
}

const Searchbar = () => {

  const [searchPrompt, setSearchPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isValidLink = isValidAmazonLink(searchPrompt)

    if (!isValidLink) return alert('Please provide a valid Amazon Product URL')

    try {
      setIsLoading(true) 

      // scrape 
      const product = await scrapeStoreProduct(searchPrompt)
    } catch (error) {
      console.log(error)
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
      <input type="text" placeholder="Enter the Product Link"
      className='searchbar-input' value={searchPrompt} onChange={(e) => setSearchPrompt(e.target.value)}/>
      <button type="submit" className="searchbar-btn" disabled={searchPrompt === ''}>{isLoading ? 'Searching...' : 'Search'}</button> 
      </form>
  )
}

export default Searchbar
