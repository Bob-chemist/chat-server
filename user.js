const db = require('./queries');

const signin = (request, response) => {
    const userReq = request.body
    let user;
  
    findUser(userReq)
      .then(foundUser => {
        user = foundUser
        return checkPassword(userReq.password, foundUser)
      })
      .then((res) => createToken())
      .then(token => updateUserToken(token, user))
      .then(() => {
        delete user.password_digest
        response.status(200).json(user)
      })
      .catch((err) => console.error(err))
}

const findUser = (userReq) => {
return db.raw("SELECT * FROM users WHERE username = ?", [userReq.username])
    .then((data) => data.rows[0])
}