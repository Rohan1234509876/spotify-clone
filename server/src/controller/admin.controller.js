import cloudinary from "../lib/cloudinary.js";
import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";

const uploadToCloudinary = async(file) => {
    try{
        const result = await cloudinary.uploader.upload(file.tempFilePath,{
            resource_type:'auto',
        })
        return result.secure_url;
    } catch (err) {
        throw new Error('Failed to upload file to Cloudinary')}
}

export const createSong = async(req,res) => {
    try{
        if(!req.files || !req.files.audioFile || !req.files.imageFile){
            return res.status(400).json({message: 'files are required'})
        }
        const {title,artist,albumId,duration} = req.body;
        const audioFile = req.files.audioFile;
        const imageFile = req.files.imageFile;

        const audioUrl = await uploadToCloudinary(audioFile);
        const imageUrl = await uploadToCloudinary(imageFile);

        const song = new Song({
            title,
            artist,
            imageUrl,
            audioUrl,
            duration,
            album: albumId || null,
        })
        await song.save();
        if(albumId){
            await Album.findByIdAndUpdate(albumId,{$push:{songs:song._id}});
        }
        res.status(201).json(song);

    } catch (err) {
        res.status(500).json({message: err.message})
    }
    
}

export const deleteSong = async(req,res) => {
    try{
        const {id} = req.params;
        const song = await Song.findById(id);
        if(song.albumId){
            await Album.findByIdAndUpdate(song.albumId,{
                $pull:{songs:song._id}
            })
        }

        await Song.findByIdAndDelete(id);
        res.status(200).json({message: 'song deleted successfully'});

    } catch(err){
        res.status(500).json({message: err.message})
    }
}

export const createAlbum = async(req,res) => {
    try{
        const {title,artist,releaseYear} = req.body;
        const {imageFile} = req.files;
        const imageUrl = await uploadToCloudinary(imageFile);

        const album = new Album({
            title,
            artist,
            releaseYear,
            imageUrl
            
        })

        await album.save();
        res.status(201).json(album);


    } catch(err){
        res.status(500).json({message: err.message})
    }
}

export const deleteAlbum = async(req,res) => {
    try{
        const {id} = req.params;
        await Song.deleteMany({albumId:id});
        await Album.findByIdAndDelete(id);
        res.status(200).json({message:'Album deleted successfully'});


    } catch(err){
        res.status(500).json({message: err.message})
    }
}

export const checkAdmin = (req,res) => {
    res.status(200).json({admin:true});
}