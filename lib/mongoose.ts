import mongoose from 'mongoose'

let isConnected = false
const MONGODDB_URI = "mongodb+srv://aditya1996:adityapokemon1@cluster0.cvdplaq.mongodb.net/?retryWrites=true&w=majority" // can be moved to the 'env' variable
export const connectToDB = async () => {

    mongoose.set('strictQuery', true)
    if (!MONGODDB_URI) return console.log('MONGO DB not defined')

    if (isConnected) return console.log('Using existing db connection')

    try{
        await mongoose.connect(MONGODDB_URI)
        isConnected = true
        console.log('MongoDB Connected')
    }
    catch(error) {
        console.log(error)
    }
    
}