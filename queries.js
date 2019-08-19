const pgp = require("pg-promise")(),
    db = pgp("postgres://postgres:postgres@localhost:5432/notifications");

const getMessages = (id = 0, receiver) => {
    return db.any("select * from notification where id > $1 and receiver like $2 or (author like $2 and receiver not like '_chat') order by id", [id, receiver])
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
        "select userid, name from users", [author]
    ).then(data => data)
}

const getPreviousMessages = (author, receiver, timestamp) => {
    return db.any(
        'select * from notification where id > $3 and author like $1 and receiver like $2 order by id desc limit 10', [author, receiver, timestamp])
        .then(data => data);
}

module.exports = {
    getMessages,
    createMessage,
    getUserNames,    
};
