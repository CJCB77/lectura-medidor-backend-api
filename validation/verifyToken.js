const jwt = require('jsonwebtoken');

//Middleware to verify the token
const verifyToken = (req, res, next) => {
    //Get the token from the header
    const token = req.headers['authorization'];
    //Check if token is not undefined
    if(token){
        //Verify the token
        jwt.verify(token, process.env.JWT_SECRET , (err, decoded) => {
            if(err){
                //If token is not valid, send error
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                });
            }else{
                //If token is valid, send the request to the next function
                req.decoded = decoded;
                next();
            }
        });
    }else{
        //If token is not provided, send error
        return res.json({
            success: false,
            message: 'Token is not provided'
        });
    }
}


module.exports = verifyToken;