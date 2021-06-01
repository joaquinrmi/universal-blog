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
    + [Errores comunes](https://github.com/joaquinrmi/universal-blog#errorescomunes)
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
        * [`/post/get-comment`](https://github.com/joaquinrmi/universal-blog#postget-comment)
        * [`/post/tag-list`](https://github.com/joaquinrmi/universal-blog#posttag-list)
    + [User API](https://github.com/joaquinrmi/universal-blog#user-api)
        * [`/user/promote`](https://github.com/joaquinrmi/universal-blog#userpromote)
        * [`/user/banish`](https://github.com/joaquinrmi/universal-blog#userbanish)
        * [`/user/remove-banishment`](https://github.com/joaquinrmi/universal-blog#userremove-banishment)
        * [`/user/banishment-list`](https://github.com/joaquinrmi/universal-blog#userbanishment-list)
    + [Upload API](https://github.com/joaquinrmi/universal-blog#upload-api)

## Variables de entorno

Para el funcionamiento de la aplicación, se deberán establecer previamente las siguientes variables de entorno del servidor.
* `SERVER_NAME`: es el nombre de la aplicación.
* `PORT`: es el número de puerto que se le asignará al servidor.
* `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_ALIAS`: datos del usuario administrador por defecto.
* `ADMIN_NAME`: si no se especifica se usará `SERVER_NAME`.
* `ADMIN_SURNAME`: si no se especifica se usará `"Admin"`.
* `DEFAULT_RANK`: rango por defecto que se le asignará a los usuarios que se creen una nueva cuenta; debe ser un número entre 0 y 3, inclusive.
* `SESSION_SECRET`: es el *secret* utilizado por `express-session`.
* `ENCRYPT_SECRET`: es la clave que se usará para encriptar las contraseñas.
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

### Errores comunes

Los siguientes son errores comunes a la mayoría de las rutas, que pueden suceder al hacer una petición al servidor.

**Error `internal_error`**:
* Descripción: ocurrió un error inesperado en el servidor y no ha sido posible procesar la solicitud.
* Código: 500 (Internal Server Error).
* Cuerpo: `undefined`.

**Error `session_does_not_exist`**:
* Descripción: este error ocurre cuando se intenta acceder a un recurso que está disponible solo para usuarios con sesión iniciada.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "session_does_not_exist"
}
```

**Error `invalid_query`**:
* Descripción: la *query* especificada está incompleta o tiene algún tipo de dato inválido.
* Código: 400 (Bad Request).
* Cuerpo:
```json
{
   "what": "invalid_query"
}
```

**Error `invalid_form`**:
* Descripción: el formulario enviado está incompleto o tiene algún tipo de dato inválido.
* Código: 400 (Bad Request).
* Cuerpo:
```json
{
   "what": "invalid_form"
}
```

### Account API

Las rutas de los servicios de cuenta comienzan siempre con `/account`.

#### `/account/create`

**Descripción**: creación de una nueva cuenta de usuario.

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

**Respuesta exitosa**:
* Código: 201 (Created).
* Cuerpo:
```json
{
   "alias": "string"
}
```

**Error `alias_is_already_used`**
* Descripción: este error ocurre cuando el *alias* enviado en el formulario ya se encuentra utilizado por otra cuenta.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "alias_is_already_used"
}
```

**Error `email_is_already_used`**
* Descripción: este error ocurre cuando el correo electrónico enviado en el formulario ya se encuentra asociado a otra cuenta.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "email_is_already_used"
}
```

**Error `email_is_banned`**
* Descripción: este error ocurre cuando el correo electrónico enviado en el formulario se encuentra bloqueado en el servidor y no puede utilizarse para crear una nueva cuenta de usuario.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "email_is_banned"
}
```

#### `/account/delete`

**Descripción**: elimina la cuenta del usuario con la sesión actual.

**Método**: `DELETE`.

**Formulario**:
```json
{
   "password": "string"
}
```

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo: `undefined`.

#### `/account/login`

**Descripción**: inicia sesión con una cuenta existente.

**Método**: `POST`.

**Formulario**:
```json
{
   "aliasOrEmail": "string",
   "password": "string"
}
``` 

**Respuesta exitosa**:
* Código: 201 (Created).
* Cuerpo:
```json
{
   "alias": "string"
}
```

**Error `incorrect_user_or_password`**:
* Descripción: la combinación usuario-contraseña es incorrecta.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "incorrect_user_or_password"
}
```

**Error `banned`**:
* Descripción: el usuario se encuentra bloqueado en el servidor.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "banned",
   "date": "number",
   "reason": "string"
}
```

#### `/account/logout`

**Descripción**: termina la sesión actual, si existe.

**Método**: `POST`.

**Formulario**: `undefined`.

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo: `undefined`.

#### `/account/restore-session`

**Descripción**: inicia sesión utilizando la cookie de sesión, la cual se crea luego de iniciar sesión en `/account/login`.

**Método**: `POST`.

**Formulario**: ninguno.

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo:
```json
{
   "alias": "string"
}
```

**Error `session_does_not_exist`**: ver (Errores comunes)[https://github.com/joaquinrmi/universal-blog#errorescomunes]

**Error `banned`**: ver (Errores comunes)[https://github.com/joaquinrmi/universal-blog#errorescomunes]

### Post API

Las rutas de los servicios de publicación comienzan siempre con `/post`.

#### `/post/create`

**Descripción**: crea una nueva publicación para el usuario con la sesión actual.

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

**Respuesta exitosa**:
* Código: 201 (Created).
* Cuerpo:
```json
{
   "postId": "string"
}
```

**Error `insufficient_permissions`**:
* Descripción: el usuario no posee los permisos suficientes para crear una publicación.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

**Error `TitleAlreadyUsed`**:
* Descripción: el usuario ya posee una publicación registrada con el mismo nombre.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "the_title_is_already_used"
}
```

#### `/post/delete`

**Descripción**: elimina una publicación si el usuario con la sesión actual es el propietario de la misma o tiene permisos para hacerlo.

**Método**: `POST`.

**Formulario**:
```json
{
   "postId": "string"
}
```

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo: `undefined`.

**Error `post_does_not_exist`**:
* Descripción: la publicación no existe.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "post_does_not_exist"
}
```

**Error `insufficient_permissions`**:
* Descripción: el usuario no es el dueño de la publicación o no tiene los permisos suficientes para eliminarla.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

#### `/post/comment`

**Descripción**: registra un nuevo comentario del usuario con la sesión actual.

**Método**: `POST`.

**Formulario**:
```json
{
   "postId": "string",
   "content": [ "string" ]
}
```

**Respuesta exitosa**:
* Código: 201 (Created).
* Cuerpo:
```json
{
   "commentId": "number"
}
```

**Error `post_does_not_exist`**:
* Descripción: la publicación no existe.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "post_does_not_exist"
}
```

**Error `insufficient_permissions`**:
* Descripción: el usuario no posee los permisos para dejar un comentario.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

#### `/post/delete-comment`

**Descripción**: elimina un comentario según su identificador.

**Método**: `POST`.

**Formulario**:
```json
{
   "id": "number"
}
```

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo: `undefined`.

**Error `comment_does_not_exist`**:
* Descripción: el comentario no existe.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "comment_does_not_exist"
}
```

**Error `insufficient_permissions`**:
* Descripción: el usuario no posee los permisos suficientes para eliminar el comentario.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

#### `/post/like`

**Descripción**: registra una nuevo "me gusta" en un artículo para el usuario con la sesión actual.

**Método**: `POST`.

**Formulario**:
```json
{
   "postId": "string",
}
```

**Respuesta exitosa**:
* Código: 201 (Created).
* Cuerpo: `undefined`.

**Error `post_does_not_exist`**:
* Descripción: la publicación no existe.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "post_does_not_exist"
}
```

**Error `insufficient_permissions`**:
* Descripción: el usuario no posee los permisos suficientes para dejar un *like*.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

#### `/post/get-single`

**Descripción**: devuelve la información de una publicación, buscándola por su `id`.

**Método**: `GET`.

**Query**:
```json
{
   "postId": "string"
}
```

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo:
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

**Error `post_does_not_exist`**:
* Descripción: la publicación no existe.
* Código: 404 (Not Found).
* Cuerpo:
```json
{
   "what": "post_does_not_exist"
}
```

#### `/post/get-list`

**Descripción**: busca una cierta cantidad de publicaciones mediante varios parámetros.

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

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo:
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

#### `post/get-comment`

**Descripción**: consulta un comentario por su identificador.

**Método**: `GET`.

**Query**:
```json
{
   "id": "number"
}
```

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo:
```json
{
   "id": "number",
   "authorId": "number",
   "postId": "string",
   "content": [ "string" ],
   "dateCreated": "number"
}
```

**Error `comment_does_not_exist`**:
* Descripción: el comentario no existe.
* Código: 404 (Not Found).
* Cuerpo:
```json
{
   "what": "comment_does_not_exist"
}
```

#### `post/tag-list`

**Descripción**: consulta todas las etiquetas (*tags*).

**Método**: `GET`.

**Query**: `undefined`.

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo:
```json
[
   {
      "tag": "string",
      "count": "number",
      "updateDate": "number"
   }
]
```

### User API

Las rutas de los servicios de usuario siempre comienzan con `/user`.

#### `/user/promote`

**Descripción**: cambia el rango de un determinado usuario, ya sea para promoverlo o degradarlo.

**Método**: `POST`.

**Formulario**:
```json
{
   "aliasOrEmail": "string",
   "rank": "reader | author | moderator | admin"
}
```

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo: `undefined`.

**Error `invalid_form`**:
* Descripción: este error ocurre cuando el valor del campo `rank` del formulario no es uno de los permitidos.
* Código: 400 (Bad Request).
* Cuerpo:
```json
{
   "what": "invalid_form"
}
```

**Error `insufficient_permissions`**:
* Descripción: este error ocurre cuando el usuario que hace la consulta no cuenta con un rango de administrador.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

**Error `user_does_not_exist`**:
* Descripción: este error ocurre cuando el usuario que se intenta promover no exite.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "user_does_not_exist"
}
```

#### `/user/banish`

**Descripción**: permite bloquear el acceso a un usuario. Además, agrega su dirección de *email* a una lista negra para que pueda usarse para crear una nueva cuenta.

**Método**: `PUT`.

**Formulario**:
```json
{
   "aliasOrEmail": "string",
   "reason": "string"
}
```
El campo `aliasOrEmail` es el alias o el email del usuario a bloquear y `reason` es un campo opcional que detalla la razón del bloqueo.

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo: `undefined`.

**Error `insufficient_permissions`**:
* Descripción: este error ocurre cuando el usuario no tiene rango de moderador ni de administrador o cuando se intenta bloquear a un usuario de mayor rango.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

**Error `user_does_not_exist`**:
* Descripción: este error ocurre cuando el usuario que se intenta bloquear no existe.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "user_does_not_exist"
}
```

#### `/user/remove-banishment`

**Descripción**: elimina el bloqueo de acceso a un usuario. Si el usuario no existe, de todas formas se quitará su dirección de correo electrónico de la lista negra.

**Método**: `PUT`.

**Formulario**:
```json
{
   "email": "string"
}
```
Se identifica al usuario por su correo electrónico, ya que su cuenta puede que haya sido eliminada.

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo: `undefined`.

**Error `insufficient_permissions`**:
* Descripción: este error ocurre cuando el usuario no tiene rango de moderador ni de administrador o cuando el usuario que se intenta desbloquar ha sido bloqueado por un usuario con un rango superior.
* Código: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

**Error `user_does_not_exist`**:
* Descripción: este error ocurre cuando el usuario que se intenta desbloquear no existe.
* Código: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "user_does_not_exist"
}
```

#### `/user/banishment-list`

**Descripción**: accede a una lista con los datos de los usuarios bloqueados del servidor.

**Método**: `GET`.

**Query**:
```json
{
   "count": "number",
   "offset": "number",
   "orderType": "email | date",
   "order": "asc | desc",
   "judgeId": "number"
}
```
El campo `judgeId` es opcional y permite filtrar los resultados según el identificador del moderador o administrador encargado del bloqueo.

**Respuesta exitosa**:
* Código: 200 (OK).
* Cuerpo:
```json
[
   {
      "banishment":
      {
         "email": "string",
         "reason": "string",
         "date": "string",
         "judge": "number"
      },
      "user":
      {
         "name": "string",
         "surname": "string",
         "alias": "string"
      }
   }
]
```
Si el usuario ha sido eliminado, entonces el campo `user` será un objeto vacío.

### Upload API

La ruta para subir imágenes es `/upload/image`. Todas las imágenes deben enviarse de una en una y deben ocupar un campo de formulario con el nombre `image`. Si la petición es exitosa, se devuelve el enlace a la imagen almacenada en Cloudinary.