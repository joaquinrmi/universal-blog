# Universal Blog

![Universal Blog](https://user-images.githubusercontent.com/28006144/114746149-c9cdf180-9d25-11eb-8fbe-dd39e14802c7.png)

Servidor "universal" para blogs desarrollado con **Node.js** y **PostgreSQL**.

* [Variables de entorno](https://github.com/joaquinrmi/universal-blog#variables-de-entorno)
* [Rangos](https://github.com/joaquinrmi/universal-blog#rangos)
    + [Lector](https://github.com/joaquinrmi/universal-blog#lector-reader)
    + [Autor](https://github.com/joaquinrmi/universal-blog#autor-author)
    + [Moderador](https://github.com/joaquinrmi/universal-blog#moderador-moderator)
    + [Administrador](https://github.com/joaquinrmi/universal-blog#administrador-admin)
* [API](https://github.com/joaquinrmi/universal-blog#api)
    + [Account API](https://github.com/joaquinrmi/universal-blog#account-api)
        * [`/account/create`](https://github.com/joaquinrmi/universal-blog#accountcreate)
        * [`/account/delete`](https://github.com/joaquinrmi/universal-blog#accountdelete)
        * [`/account/login`](https://github.com/joaquinrmi/universal-blog#accountlogin)
        * [`/account/logout`](https://github.com/joaquinrmi/universal-blog#accountlogout)
        * [`/account/restore-session`](https://github.com/joaquinrmi/universal-blog#accountrestore-session)
    + [Post API](https://github.com/joaquinrmi/universal-blog#post-api)
        * [`/post/create`](https://github.com/joaquinrmi/universal-blog#postcreate)
        * [`/post/delete`](https://github.com/joaquinrmi/universal-blog#postdelete)
        * [`/post/comment`](https://github.com/joaquinrmi/universal-blog#postcomment)
        * [`/post/delete-comment`](https://github.com/joaquinrmi/universal-blog#postdelete-comment)
        * [`/post/like`](https://github.com/joaquinrmi/universal-blog#postlike)
        * [`/post/get-single`](https://github.com/joaquinrmi/universal-blog#postget-single)
        * [`/post/get-list`](https://github.com/joaquinrmi/universal-blog#postget-list)
    + [User API](https://github.com/joaquinrmi/universal-blog#user-api)
        * [`/user/promote`](https://github.com/joaquinrmi/universal-blog#userpromote)
    + [Upload API](https://github.com/joaquinrmi/universal-blog#upload-api)

## Variables de entorno

Para el funcionamiento de la aplicación, habrá que establecer previamente las siguientes variables de entorno del servidor.
* `SERVER_NAME`: es el nombre de la aplicación.
* `PORT`: es el número de puerto que se le asignará al servidor.
* `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_ALIAS`: datos del usuario administrador por defecto.
* `ADMIN_NAME`: si no se especifica se usará `SERVER_NAME`.
* `ADMIN_SURNAME`: si no se especifica se usará `"Admin"`.
* `DEFAULT_RANK`: rango por defecto que se le asignará a los usuarios que se creen una nueva cuenta; debe ser un número entre 0 y 3, inclusive.
* `SESSION_SECRET`: es el *secret* utilizado por `express-session`.
* `ENCRYPT_SECRET`: es la clave que se usará para encriptar las contraseñas.
* `TITLE_ENCRYPT_SECRET`: es la clave que se usará para encriptar los títulos de las publicaciones, con el fin de generar un identificador.
* `PGHOST`, `PGUSER`, `PGDATABASE`, `PGPASSWORD` y `PGPORT`: son los parámetros de conexión con la base de datos de **PostgreSQL**.
* `CLOUD_NAME`, `CLOUD_API_KEY` y `CLOUD_API_SECRET`: son los parámetros de conexión con el servidor de **Cloudinary**.

## Rangos

Los usuarios que posean una cuenta creada tendrán un **rango**, el cual determinará qué acciones pueden realizar dentro de la aplicación. Los siguientes son los cuatro tipos de usuarios:
* **Lector**: se identifica en la base de datos con el número `0` y en las consultas con el identificador `"reader"`.
* **Autor**: se identifica en la base de datos con el número `1` y en las consultas con el identificador `"author"`.
* **Moderador**: se identifica en la base de datos con el número `2` y en las consultas con el identificador `"moderator"`.
* **Administrador**: se identifica en la base de datos con el número `3` y en las consultas con el identificador `"admin"`.

### Lector (reader)

Son los usuarios más básicos y pueden **comentar** y dar **me gusta** a las publicaciones.

### Autor (author)

Estos usuarios pueden **crear publicaciones** y administrarlas, además de realizar las acciones de un lector.

### Moderador (moderator)

Pueden realizar las mismas acciones que un autor y además son capaces de **eliminar publicaciones y comentarios** de cualquier otro usuario.

### Administrador (admin)

Son capaces de realizar todas las acciones disponibles en la aplicación, lo cual incluye las acciones de los moderadores y el poder de **cambiar el rango** de cualquier otro usuario.

## API

La API se divide en cuatro partes: `account`, que administra los servicios relacionados con las cuentas de usuario; `post`, que administra las acciones con publicaciones; `user`, que administra a los usuarios y `upload` que permite cargar imágenes.

La ruta de todos los servicios comienza siempre con `/api`.

### Account API

Las rutas de los servicios de cuenta comienzan siempre con `/account`.

#### `/account/create`

**Descripción**: Creación de una nueva cuenta de usuario.

**Método**: `POST`.

**Formulario**:
```json
{
   "password": "string",
   "name": "string",
   "surname": "string",
   "alias": "string",
   "email": "string"
}
```
El campo `password` debe ser una cadena de entre y `8` y `32` caracteres, inclusive. Tanto `name` como `surname` deben tener una longitud máxima de `32` caracteres, mientras que `alias` solo puede tener a lo más `16` caracteres.

**Respuesta**:
```json
{
   "alias": "string"
}
```

#### `/account/delete`

**Descripción**: Elimina la cuenta del usuario con la sesión actual.

**Método**: `DELETE`.

**Formulario**:
```json
{
   "password": "string"
}
```

**Respuesta**:
```json
{}
```

#### `/account/login`

**Descripción**: Inicia sesión con una cuenta existente.

**Método**: `POST`.

**Formulario**:
```json
{
   "aliasOrEmail": "string",
   "password": "string"
}
``` 

**Respuesta**:
```json
{
   "alias": "string"
}
```

#### `/account/logout`

**Descripción**: Termina la sesión actual, si existe.

**Método**: `POST`.

**Formulario**: `undefined`.

**Respuesta**: `undefined`.

#### `/account/restore-session`

**Descripción**: Inicia sesión utilizando la cookie de sesión, la cual se crea luego de iniciar sesión en `/account/login`.

**Método**: `POST`.

**Formulario**: ninguno.

**Respuesta**:
```json
{
   "alias": "string"
}
```

### Post API

Las rutas de los servicios de publicación comienzan siempre con `/post`.

#### `/post/create`

**Descripción**: Crea una nueva publicación para el usuario con la sesión actual.

**Método**: `POST`.

**Formulario**:
```json
{
   "title": "string",
   "content": "string",
   "cover": "string",
   "gallery": [ "string" ],
   "galleryPosition": [ "number" ],
   "tags": [ "string" ]
}
```
El campo `gallery` es un arreglo con los enlaces de las imágenes del artículo, mientras que `galleryPosition` debe ser un arreglo numérico del mismo tamaño que `gallery` y que especificará la posición de las imágenes con respecto de los párrafos. Por ejemplo, el índice `0` especifica que la imagen debe colocarse justo antes del comienzo del primer párrafo.

**Respuesta**:
```json
{
   "postId": "string"
}
```

#### `/post/delete`

**Descripción**: Elimina una publicación si el usuario con la sesión actual es el propietario de la misma.

**Método**: `POST`.

**Formulario**:
```json
{
   "postId": "string"
}
```

**Respuesta**:
```json
{}
```

#### `/post/comment`

**Descripción**: Registra un nuevo comentario del usuario con la sesión actual.

**Método**: `POST`.

**Formulario**:
```json
{
   "postId": "string",
   "content": [ "string" ]
}
```

**Respuesta**:
```json
{}
```

#### `/post/delete-comment`

**Descripción**: Elimina un comentario según su `id`.

**Método**: `POST`.

**Formulario**:
```json
{
   "id": "number"
}
```

**Respuesta**:
```json
{}
```

#### `/post/like`

**Descripción**: Registra una nuevo "me gusta" en un artículo para el usuario con la sesión actual.

**Método**: `POST`.

**Formulario**:
```json
{
   "postId": "string",
}
```

**Respuesta**:
```json
{}
```

#### `/post/get-single`

**Descripción**: Devuelve la información de una publicación, buscándola por su `id`.

**Método**: `GET`.

**Query**:
```json
{
   "postId": "string"
}
```

**Respuesta**:
```json
{
   "title": "string",
   "content": "string",
   "cover": "string",
   "gallery": [ "string" ],
   "galleryPosition": [ "number" ],
   "tags": [ "string" ],
   "authorAlias": "string",
   "commentCount": "number",
   "likeCount": "number",
   "dateCreated": "number"
}
```

#### `/post/get-list`

**Descripción**: Busca una cierta cantidad de publicaciones mediante varios parámetros.

**Método**: `GET`.

**Query**:
```json
{
   "offset": "number",
   "count": "number",
   "author": "string",
   "tags": [ "string" ],
   "orderType": "title | comment_count | like_count | date_created",
   "order": "asc | desc"
}
```
Los parámetros `offset` y `count` son obligatorios, mientras que los demás son opcionales. Los valores por defecto de `orderType` y `order` son, respectivamente, `"date_created"` y `"asc"`.

**Respuesta**:
```json
[
   {
      "title": "string",
      "content": "string",
      "cover": "string",
      "gallery": [ "string" ],
      "galleryPosition": [ "number" ],
      "tags": [ "string" ],
      "authorAlias": "string",
      "commentCount": "number",
      "likeCount": "number",
      "dateCreated": "number"
   }
]
```

### User API

Las rutas de los servicios de usuario siempre comienzan con `/user`.

#### `/user/promote`

**Descripción**: Le otorga un nuevo rango a un usuario.

**Método**: `POST`.

**Form**:
```json
{
   "aliasOrEmail": "string",
   "rank": "reader | author | moderator | admin"
}
```

**Respuesta**:
```json
{}
```

### Upload API

La ruta para subir imágenes es `/upload/image`. Todas las imágenes deben enviarse de una en una y deben ocupar un campo de formulario con el nombre `image`. Si la petición es exitosa, se devuelve el enlace a la imagen almacenada en Cloudinary.