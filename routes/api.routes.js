const router = require('express').Router();
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

router.get('/songs', async (req, res) => {
  try {
    const songs = await prisma.song.findMany({
      // take:10,
      skip:0,
      orderBy:{
        avgRating:'desc'
      },
      include:{artists:true}
    })

    res.json({
      status:"success",
      songs
    })
  } catch (error) {
    res.status(500).json({
      status:"error",
      msg:"error while getting songs: "+error.message
    })
  }
});

router.get('/artists', async (req, res)=>{
  try {
    const artists = await prisma.artist.findMany({
      take:10,
      skip:0,
      include:{songs:true}
    })
  
    res.json({
      status:"success",
      artists
    })
  } catch (error) {
    res.status.json({
      status:"error",
      msg:"error while getting artists "+error.message
    })
  }
})

router.post('/songs', async(req, res)=>{
  const {songName, dateOfRelease, coverImg="img", artistName, dob, bio} = req.body
  try {
    const song = await prisma.song.create({
      data:{ name:songName, dateOfRelease, coverImg }
    })
    console.log("here")
    const artistFound = await prisma.artist.findFirst({
      where:{name:artistName}
    })
    if(artistFound){
      const songOnArtist = await prisma.songsOnArtists.create({
        data:{songId:song.id, artistId:artistFound.id}
      })
      return res.status(201).json({
        status:"added",
        songOnArtist
      })
    }
    const artist = await prisma.artist.create({
      data:{ name:artistName, dob, bio}
    })
    const songOnArtist = await prisma.songsOnArtists.create({
      data:{songId:song.id, artistId:artist.id}
    })
    res.status(201).json({
      status:"added",
      songOnArtist
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error.message)
  }
})

// router.post('/posting', (req, res)=>{
//   console.log(req.body)
// })

// router.delete("/delete/:id", async(req, res)=>{
//   const {id} = req.params
//   try {
//     const song = await prisma.song.delete({
//       where:{
//         id:parseInt(id)
//       }
//     })
//     res.send(song)
//   } catch (error) {
//     res.status(500).json({error:error.message})
//   }
// })

router.get("/", async(req, res)=>{
  res.send(
    await prisma.songsOnArtists.findMany({
      include:{
      song:true
      }
    })
  )
})

module.exports = router;
