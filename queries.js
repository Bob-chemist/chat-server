const pgp = require("pg-promise")(),
    db = pgp('postgres://postgres:postgres@localhost:5432/notifications');

const getUnseenMessages = userId => {
  return db.any('' +
      'select * from notification ' +
      'where id > (' +
      '     select last_seen from users ' +
      '     where userid like $1) ' +
      'and receiver in (\'_chat\', $1) ' +
      'order by id',
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
    return db.any('select * from users').then(data => data);
};

const getMessages = (userId, companionId, offset) => {
    return db.any('' +
        'select * from notification ' +
        'where ' +
        (companionId != '_chat'
            ? 'author in($1, $2) ' +
            '  and receiver in($1, $2) '
            : ' receiver like $2 ') +
        'order by id desc limit 20 offset $3',
        [userId, companionId, offset]
    ).then(data => data);
};

const setLastSeen = userId => {
  return db.none(
    'update users set last_seen = $2 where userid like $1',
    [userId, new Date().getTime()]
  );
};

module.exports = {
  getUnseenMessages,
  createMessage,
  getUserNames,
  getMessages,
  setLastSeen,
};
