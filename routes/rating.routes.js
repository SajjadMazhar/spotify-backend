const router = require('express').Router();
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const { authenticateUser } = require('../middlewares/auth.middleware');

router.post("/song/:songId", authenticateUser, async(req, res)=>{
    const {rating} = req.body
    const {songId} = req.params
    const id = req.id
    if(!(rating && songId && id)){
        return res.status(400).json({
            status:"failed",
            msg:"please enter all the input fields"
        })
    }
    if(rating > 5){
        return res.status(400).json({
            status:"failed",
            msg:"rating should be less or equal to 5"
        })
    }
    try {
        const rateIt = await prisma.rating.create({
            data:{
                rating,
                songId:parseInt(songId),
                userId:id
            }
        })
        const aggregations = await prisma.rating.aggregate({
            where:{
                songId:parseInt(songId)
            },
            _avg:{rating:true}
        })
        console.log(aggregations)
        const song = await prisma.song.update({
            where:{
                id:parseInt(songId)
            },
            data:{
                avgRating:Math.round(aggregations._avg.rating)
            }
        })

        // const songsOfartist = await prisma.songsOnArtists.findMany({
            
        // })

        res.status(200).json({
            status:"success",
            rating:song
        })

    } catch (error) {
        res.status(500).json({
            status:"error",
            msg:"error while rating: "+error.message
        })
    }
})



module.exports = router