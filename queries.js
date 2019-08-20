const pgp = require('pg-promise')(),
  db = pgp('postgres://postgres:postgres@localhost:5432/notifications');

const getUnseenMessages = userId => {
  return db.any(
    ' select * from notification where id > (select last_seen from users where userid like $1) and receiver like \'_chat\' ' + 
    '   union ' +
    ' select author, n.id, message, receiver from notification n inner join users u on u.userid like n.receiver where n.id > u.last_seen and u.userid like $1',
  [userId]
  ).then(data => data);  
}

const getMessagesByUser = (userId, companionId) => {
  return db.any('select * from notification where (author like $1 and receiver like $2) or (author like $2 and receiver like $1) ' + 
    'and id < (select last_seen from users where userid like $1) order by id limit 10', [userId, companionId]).then(data => data);
}

const getMessages = (id = 0, receiver) => {
  return db
    .any(
      'select * from notification where id > $1 and receiver like $2 or (author like $2 and receiver not like \'_chat\') order by id',
      [id, receiver]
    )
    .then(data => data);
};

const createMessage = ({ author, id, message, receiver }) => {
  return db.none(
    'INSERT INTO notification (author, id, message,  receiver) VALUES ($1, $2, $3, $4)',
    [author, +id, message, receiver]
  );
};

const getUserNames = () => {  
    return db.any('select userid, name, last_seen from users').then(data => data);
  
};

const getPreviousMessages = (author, receiver, timestamp) => {
  return db
    .any(
      'select * from notification where id > $3 and author like $1 and receiver like $2 order by id desc limit 10',
      [author, receiver, timestamp]
    )
    .then(data => data);
};

const setLastSeen = userId => {  
  return db.none(
    'update users set last_seen = $2 where userid like $1',
    [userId, new Date().getTime()]
  );
}

module.exports = {
  getUnseenMessages,
  getMessagesByUser,
  getMessages,
  createMessage,
  getUserNames,
  setLastSeen,
};
