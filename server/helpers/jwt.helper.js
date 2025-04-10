const jwt = require('jsonwebtoken');
// const User = require('../apis/user/user.model');
const config = require('../../config');

function decodeToken(token) {
    return jwt.decode(token.replace('Bearer ', ''));
}

async function getAuthUser(token) {
    try {
        const tokenData = decodeToken(token);
        // console.log('tokeData', tokenData.id);
        const user = await User.findById(tokenData.id);
        // console.log("user123", user);
        // const resUser = JSON.parse(JSON.stringify(user));
        // delete resUser.password;
        return user;
    } catch (e) {
        return null;
    }
}

const expiresIn = "365d";

function getJWTToken(data) {
    const token = `Bearer ${jwt.sign(data, config.tokenSecret, { expiresIn })}`;
    return token;
}

module.exports = { decodeToken, getJWTToken, getAuthUser };
