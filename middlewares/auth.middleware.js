const jwt = require("jsonwebtoken")

exports.authenticateUser = async (req, res, next)=>{
    const authToken = req.headers.authorization
    if(!authToken){
        return res.status(400).json({
            status:"failed",
            msg:"token missing"
        })
    }
    const decoded = jwt.verify(authToken, process.env.TOKEN_SECRET)
    req.id = decoded.id
    next()
}