import { Song } from "../models/song.model.js"

export const getAllSong = async(req,res) => {
    try{
        const songs = await Song.find().sort({createdAt : -1})
        res.json(songs)

    } catch(err){
        res.status(401).json({message:err.message})
    }
}




export const getFeaturedSongs = async(req,res) => {
    try{
        const songs = await Song.aggregate([
            {
                $sample : {size:6},
            },
            {
                $project : {
                    _id : 1,
                    title : 1,
                    artist : 1,
                    imageUrl : 1,
                    audioUrl : 1,
                },
            },
        ]);

        res.json(songs)

    } catch(err){
        console.log(err.message)
    }
}


export const getTrendingSongs = async(req,res) => {
    try{
        const songs = await Song.aggregate([
            {
                $sample : {size:4},
            },
            {
                $project : {
                    _id : 1,
                    title : 1,
                    artist : 1,
                    imageUrl : 1,
                    audioUrl : 1,
                },
            },
        ]);

        res.json(songs)

    } catch(err){
        console.log(err.message)
    }
}

export const getMadeForYouSongs = async(req,res) => {
    try{
        const songs = await Song.aggregate([
            {
                $sample : {size:4},
            },
            {
                $project : {
                    _id : 1,
                    title : 1,
                    artist : 1,
                    imageUrl : 1,
                    audioUrl : 1,
                },
            },
        ]);

        res.json(songs)

    } catch(err){
        console.log(err.message)
    }
}