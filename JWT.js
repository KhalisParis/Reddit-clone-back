const {sign, verify} = require('jsonwebtoken' ) ;

const createToken = (user) => {
    const accessToken = sign({username: user.username, id: user.id}, "SECRET");

    return accessToken;

}

const validateToken = (req, res, next) => {
    const accessToken = req.cookies["access-token"]
    console.log(accessToken);
    if (!accessToken) 
        return res.status(400).json({error :"user not authenticated"})
    
    try{
        const validToken = verify(accessToken, "SECRET");
        if (validToken) {
            req.authenticated = true;
            return next();
        }
    }
    catch (err) {
        return res.status(400).json({error : err.message})
    }
}
module.exports = {createToken, validateToken}