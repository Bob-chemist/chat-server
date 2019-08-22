const pgp = require('pg-promise')(),
      db = pgp('postgres://postgres:postgres@localhost:5432/notifications');

const getUnseenMessages = userId => {
  return db.any(
    'SELECT * FROM notification ' +
    'WHERE id > ( ' +
    '     SELECT last_seen FROM users ' +
    '     WHERE userid LIKE $1) ' +
    'AND receiver IN (\'_chat\', $1) ' +
    'ORDER BY id',
    [userId]
  ).then(data => data);
};

const createMessage = ({ author, id, message, receiver }) => {
  return db.none(
    'INSERT INTO notification (author, id, message,  receiver) VALUES ($1, $2, $3, $4)',
    [author, +id, message, receiver]
  );
};

const getUserNames = () => {
  return db.any('SELECT * FROM users').then(data => data);
};

const getMessages = (userId, companionId, offset) => {
  return db.any(
    'SELECT * FROM notification ' +
    'WHERE ' +
    (companionId !== '_chat'
      ? 'author IN ($1, $2) ' + ' AND receiver IN ($1, $2) '
      : ' receiver like $2 ') +
    'ORDER BY id DESC LIMIT 20 OFFSET $3',
    [userId, companionId, offset]
  ).then(data => data);
};

const setLastSeen = userId => {
  return db.none('UPDATE users SET last_seen = $2 WHERE userid LIKE $1',
    [userId,new Date().getTime(),]);
};

module.exports = {
  getUnseenMessages,
  createMessage,
  getUserNames,
  getMessages,
  setLastSeen,
};
