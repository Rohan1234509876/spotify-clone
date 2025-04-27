import { Album } from "../models/album.model.js"
import { Song } from "../models/song.model.js"
import { User } from "../models/user.model.js"

export const getStats = async(req,res)=> {
    try{
        const {totalSongs,totalUsers,totalAlbums,uniqueArtists} = await Promise.all([
            Song.countDocument(),
            User.countDocument(),
            Album.countDocument(),


            Song.aggregate([
                {
                    $unionWith : {
                        coll : 'albums',
                        pipeline : [],
                    },
                },
                {
                    $group : {
                        _id : "$artist",
                    },
                },
                {
                    $count : "count"
                },
            ]

            )


        ])

        res.status(200).json({
            totalSongs,
            totalUsers,
            totalAlbums,
            totalArtists : uniqueArtists[0]?.count || 0

        })

    } catch(err){
        console.log(err.message)
    }
}