import { Album } from "../models/album.model.js";

export const getAllAlbums = async(req,res) => {
    try{
        const albums = await Album.find();
        res.status(200).json(albums);

    }  catch(err){
        res.status(500).json({message:err.message})
    }
}

export const getAlbumById = async(req,res) => {
    try{
        const {albumId} = req.params;
        const album = await Album.findById(albumId).populate('songs');
        if(!album){
            return res.status(404).json({message:'Album not found'})
        }
        res.status(200).json(album);
        

    } catch(err){
        res.status(500).json({message:err.message})
    }
}