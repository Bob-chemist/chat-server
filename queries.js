const pgp = require("pg-promise")(),
    db = pgp("postgres://postgres:postgres@localhost:5432/notifications");

const getMessages = (id = 0) => {
    return db.any("select * from notification where id > $1 order by id desc", [id])
        .then(data => data);
};

const createMessage = (message) => {
    return db.none (
        "INSERT INTO notification (author, id, message, date) VALUES ($1, $2, $3, $4)",
        [1, new Date().getTime(), message.message, new Date()]
    );
};

const getUsernames = author => {
    return db.any(
        'select name from users where userid <> $1', [author]
    ).then(data => data)
}

const authorize = (login, password) => {
    return db.any(
        'select * from users where name like $1 and password like $2', [login, password]
    ).then(data => data.length ? true : false)
}

module.exports = {
    getMessages,
    createMessage,
    getUsernames,
    authorize,
};
