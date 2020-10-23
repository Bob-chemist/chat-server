create table notification
(
    author   varchar   not null,
    id       bigserial not null,
    message  varchar   not null,
    receiver varchar
);

alter table notification
    owner to postgres;

create table users
(
    userid    varchar   not null,
    name      varchar   not null,
    password  varchar   not null,
    id        serial    not null
        constraint users_pk
            primary key,
    last_seen bigserial not null
);

alter table users
    owner to postgres;

create unique index users_id_uindex
    on users (id);

