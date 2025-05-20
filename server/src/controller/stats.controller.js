import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

export const getStats = async (req, res) => {
  try {
    const [totalSongs, totalUsers, totalAlbums, uniqueArtists] = await Promise.all([
      Song.countDocuments(),
      User.countDocuments(),
      Album.countDocuments(),
      Song.aggregate([
        {
          $group: {
            _id: "$artist",
          },
        },
        {
          $count: "count",
        },
      ]),
    ]);

    console.log("uniqueArtists result:", uniqueArtists);

    res.status(200).json({
      totalSongs,
      totalUsers,
      totalAlbums,
      totalArtists: (uniqueArtists && uniqueArtists.length > 0) ? uniqueArtists[0].count : 0,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
