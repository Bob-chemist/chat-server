const pgp = require("pg-promise")(),
    db = pgp("postgres://postgres:postgres@localhost:5432/notifications");

const getMessages = (id = 0, receiver) => {
    return db.any("select * from notification where id > $1 and receiver = $2 or author = $2 and receiver <> 0 order by id", [id, receiver])
        .then(data => data);
};

const createMessage = ({author, message, receiver}) => {
    return db.none (
        "INSERT INTO notification (author, id, message,  receiver) VALUES ($1, $2, $3, $4)",
        [author, new Date().getTime(), message, receiver]
    );
};

const getUserNames = author => {
    return db.any(
        'select userid, name from users where userid <> $1', [author]
    ).then(data => data)
}

const authorize = (login, password) => {
    return db.oneOrNone(
        'select distinct userid, name from users where name like $1 and password like $2', [login, password])
        .then(data => data);    
}

module.exports = {
    getMessages,
    createMessage,
    getUserNames,
    authorize,
};
