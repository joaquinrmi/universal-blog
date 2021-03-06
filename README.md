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
    + [Errores comunes](https://github.com/joaquinrmi/universal-blog#errores-comunes)
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

Para el funcionamiento de la aplicaci??n, se deber??n establecer previamente las siguientes variables de entorno del servidor.
* `SERVER_NAME`: es el nombre de la aplicaci??n.
* `PORT`: es el n??mero de puerto que se le asignar?? al servidor.
* `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_ALIAS`: datos del usuario administrador por defecto.
* `ADMIN_NAME`: si no se especifica se usar?? `SERVER_NAME`.
* `ADMIN_SURNAME`: si no se especifica se usar?? `"Admin"`.
* `DEFAULT_RANK`: rango por defecto que se le asignar?? a los usuarios que se creen una nueva cuenta; debe ser un n??mero entre 0 y 3, inclusive.
* `SESSION_SECRET`: es el *secret* utilizado por `express-session`.
* `ENCRYPT_SECRET`: es la clave que se usar?? para encriptar las contrase??as.
* `PGHOST`, `PGUSER`, `PGDATABASE`, `PGPASSWORD` y `PGPORT`: son los par??metros de conexi??n con la base de datos de **PostgreSQL**.
* `CLOUD_NAME`, `CLOUD_API_KEY` y `CLOUD_API_SECRET`: son los par??metros de conexi??n con el servidor de **Cloudinary**.

## Rangos

Los usuarios que posean una cuenta creada tendr??n un **rango**, el cual determinar?? qu?? acciones pueden realizar dentro de la aplicaci??n. Los siguientes son los cuatro tipos de usuarios:
* **Lector**: se identifica en la base de datos con el n??mero `0` y en las consultas con el identificador `"reader"`.
* **Autor**: se identifica en la base de datos con el n??mero `1` y en las consultas con el identificador `"author"`.
* **Moderador**: se identifica en la base de datos con el n??mero `2` y en las consultas con el identificador `"moderator"`.
* **Administrador**: se identifica en la base de datos con el n??mero `3` y en las consultas con el identificador `"admin"`.

### Lector (reader)

Son los usuarios m??s b??sicos y pueden **comentar** y dar **me gusta** a las publicaciones.

### Autor (author)

Estos usuarios pueden **crear publicaciones** y administrarlas, adem??s de realizar las acciones de un lector.

### Moderador (moderator)

Pueden realizar las mismas acciones que un autor y adem??s son capaces de **eliminar publicaciones y comentarios** de cualquier otro usuario.

### Administrador (admin)

Son capaces de realizar todas las acciones disponibles en la aplicaci??n, lo cual incluye las acciones de los moderadores y el poder de **cambiar el rango** de cualquier otro usuario.

## API

La API se divide en cuatro partes: `account`, que administra los servicios relacionados con las cuentas de usuario; `post`, que administra las acciones con publicaciones; `user`, que administra a los usuarios y `upload` que permite cargar im??genes.

La ruta de todos los servicios comienza siempre con `/api`.

### Errores comunes

Los siguientes son errores comunes a la mayor??a de las rutas, que pueden suceder al hacer una petici??n al servidor.

**Error `internal_error`**:
* Descripci??n: ocurri?? un error inesperado en el servidor y no ha sido posible procesar la solicitud.
* C??digo: 500 (Internal Server Error).
* Cuerpo: `undefined`.

**Error `session_does_not_exist`**:
* Descripci??n: este error ocurre cuando se intenta acceder a un recurso que est?? disponible solo para usuarios con sesi??n iniciada.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "session_does_not_exist"
}
```

**Error `invalid_query`**:
* Descripci??n: la *query* especificada est?? incompleta o tiene alg??n tipo de dato inv??lido.
* C??digo: 400 (Bad Request).
* Cuerpo:
```json
{
   "what": "invalid_query"
}
```

**Error `invalid_form`**:
* Descripci??n: el formulario enviado est?? incompleto o tiene alg??n tipo de dato inv??lido.
* C??digo: 400 (Bad Request).
* Cuerpo:
```json
{
   "what": "invalid_form"
}
```

### Account API

Las rutas de los servicios de cuenta comienzan siempre con `/account`.

#### `/account/create`

**Descripci??n**: creaci??n de una nueva cuenta de usuario.

**M??todo**: `POST`.

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
El campo `password` debe ser una cadena de entre y `8` y `32` caracteres, inclusive. Tanto `name` como `surname` deben tener una longitud m??xima de `32` caracteres, mientras que `alias` solo puede tener a lo m??s `16` caracteres.

**Respuesta exitosa**:
* C??digo: 201 (Created).
* Cuerpo:
```json
{
   "alias": "string"
}
```

**Error `alias_is_already_used`**
* Descripci??n: este error ocurre cuando el *alias* enviado en el formulario ya se encuentra utilizado por otra cuenta.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "alias_is_already_used"
}
```

**Error `email_is_already_used`**
* Descripci??n: este error ocurre cuando el correo electr??nico enviado en el formulario ya se encuentra asociado a otra cuenta.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "email_is_already_used"
}
```

**Error `email_is_banned`**
* Descripci??n: este error ocurre cuando el correo electr??nico enviado en el formulario se encuentra bloqueado en el servidor y no puede utilizarse para crear una nueva cuenta de usuario.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "email_is_banned"
}
```

#### `/account/delete`

**Descripci??n**: elimina la cuenta del usuario con la sesi??n actual.

**M??todo**: `DELETE`.

**Formulario**:
```json
{
   "password": "string"
}
```

**Respuesta exitosa**:
* C??digo: 200 (OK).
* Cuerpo: `undefined`.

#### `/account/login`

**Descripci??n**: inicia sesi??n con una cuenta existente.

**M??todo**: `POST`.

**Formulario**:
```json
{
   "aliasOrEmail": "string",
   "password": "string"
}
``` 

**Respuesta exitosa**:
* C??digo: 201 (Created).
* Cuerpo:
```json
{
   "alias": "string"
}
```

**Error `incorrect_user_or_password`**:
* Descripci??n: la combinaci??n usuario-contrase??a es incorrecta.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "incorrect_user_or_password"
}
```

**Error `banned`**:
* Descripci??n: el usuario se encuentra bloqueado en el servidor.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "banned",
   "date": "number",
   "reason": "string"
}
```

#### `/account/logout`

**Descripci??n**: termina la sesi??n actual, si existe.

**M??todo**: `POST`.

**Formulario**: `undefined`.

**Respuesta exitosa**:
* C??digo: 200 (OK).
* Cuerpo: `undefined`.

#### `/account/restore-session`

**Descripci??n**: inicia sesi??n utilizando la cookie de sesi??n, la cual se crea luego de iniciar sesi??n en `/account/login`.

**M??todo**: `POST`.

**Formulario**: ninguno.

**Respuesta exitosa**:
* C??digo: 200 (OK).
* Cuerpo:
```json
{
   "alias": "string"
}
```

**Error `session_does_not_exist`**: ver (Errores comunes)[https://github.com/joaquinrmi/universal-blog#errores-comunes]

**Error `banned`**: ver (Errores comunes)[https://github.com/joaquinrmi/universal-blog#errores-comunes]

### Post API

Las rutas de los servicios de publicaci??n comienzan siempre con `/post`.

#### `/post/create`

**Descripci??n**: crea una nueva publicaci??n para el usuario con la sesi??n actual.

**M??todo**: `POST`.

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
El campo `gallery` es un arreglo con los enlaces de las im??genes del art??culo, mientras que `galleryPosition` debe ser un arreglo num??rico del mismo tama??o que `gallery` y que especificar?? la posici??n de las im??genes con respecto de los p??rrafos. Por ejemplo, el ??ndice `0` especifica que la imagen debe colocarse justo antes del comienzo del primer p??rrafo.

**Respuesta exitosa**:
* C??digo: 201 (Created).
* Cuerpo:
```json
{
   "postId": "string"
}
```

**Error `insufficient_permissions`**:
* Descripci??n: el usuario no posee los permisos suficientes para crear una publicaci??n.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

**Error `TitleAlreadyUsed`**:
* Descripci??n: el usuario ya posee una publicaci??n registrada con el mismo nombre.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "the_title_is_already_used"
}
```

#### `/post/delete`

**Descripci??n**: elimina una publicaci??n si el usuario con la sesi??n actual es el propietario de la misma o tiene permisos para hacerlo.

**M??todo**: `POST`.

**Formulario**:
```json
{
   "postId": "string"
}
```

**Respuesta exitosa**:
* C??digo: 200 (OK).
* Cuerpo: `undefined`.

**Error `post_does_not_exist`**:
* Descripci??n: la publicaci??n no existe.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "post_does_not_exist"
}
```

**Error `insufficient_permissions`**:
* Descripci??n: el usuario no es el due??o de la publicaci??n o no tiene los permisos suficientes para eliminarla.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

#### `/post/comment`

**Descripci??n**: registra un nuevo comentario del usuario con la sesi??n actual.

**M??todo**: `POST`.

**Formulario**:
```json
{
   "postId": "string",
   "content": [ "string" ]
}
```

**Respuesta exitosa**:
* C??digo: 201 (Created).
* Cuerpo:
```json
{
   "commentId": "number"
}
```

**Error `post_does_not_exist`**:
* Descripci??n: la publicaci??n no existe.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "post_does_not_exist"
}
```

**Error `insufficient_permissions`**:
* Descripci??n: el usuario no posee los permisos para dejar un comentario.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

#### `/post/delete-comment`

**Descripci??n**: elimina un comentario seg??n su identificador.

**M??todo**: `POST`.

**Formulario**:
```json
{
   "id": "number"
}
```

**Respuesta exitosa**:
* C??digo: 200 (OK).
* Cuerpo: `undefined`.

**Error `comment_does_not_exist`**:
* Descripci??n: el comentario no existe.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "comment_does_not_exist"
}
```

**Error `insufficient_permissions`**:
* Descripci??n: el usuario no posee los permisos suficientes para eliminar el comentario.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

#### `/post/like`

**Descripci??n**: registra una nuevo "me gusta" en un art??culo para el usuario con la sesi??n actual.

**M??todo**: `POST`.

**Formulario**:
```json
{
   "postId": "string",
}
```

**Respuesta exitosa**:
* C??digo: 201 (Created).
* Cuerpo: `undefined`.

**Error `post_does_not_exist`**:
* Descripci??n: la publicaci??n no existe.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "post_does_not_exist"
}
```

**Error `insufficient_permissions`**:
* Descripci??n: el usuario no posee los permisos suficientes para dejar un *like*.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

#### `/post/get-single`

**Descripci??n**: devuelve la informaci??n de una publicaci??n, busc??ndola por su `id`.

**M??todo**: `GET`.

**Query**:
```json
{
   "postId": "string"
}
```

**Respuesta exitosa**:
* C??digo: 200 (OK).
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
* Descripci??n: la publicaci??n no existe.
* C??digo: 404 (Not Found).
* Cuerpo:
```json
{
   "what": "post_does_not_exist"
}
```

#### `/post/get-list`

**Descripci??n**: busca una cierta cantidad de publicaciones mediante varios par??metros.

**M??todo**: `GET`.

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
Los par??metros `offset` y `count` son obligatorios, mientras que los dem??s son opcionales. Los valores por defecto de `orderType` y `order` son, respectivamente, `"date_created"` y `"asc"`.

**Respuesta exitosa**:
* C??digo: 200 (OK).
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

**Descripci??n**: consulta un comentario por su identificador.

**M??todo**: `GET`.

**Query**:
```json
{
   "id": "number"
}
```

**Respuesta exitosa**:
* C??digo: 200 (OK).
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
* Descripci??n: el comentario no existe.
* C??digo: 404 (Not Found).
* Cuerpo:
```json
{
   "what": "comment_does_not_exist"
}
```

#### `post/tag-list`

**Descripci??n**: consulta todas las etiquetas (*tags*).

**M??todo**: `GET`.

**Query**: `undefined`.

**Respuesta exitosa**:
* C??digo: 200 (OK).
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

**Descripci??n**: cambia el rango de un determinado usuario, ya sea para promoverlo o degradarlo.

**M??todo**: `POST`.

**Formulario**:
```json
{
   "aliasOrEmail": "string",
   "rank": "reader | author | moderator | admin"
}
```

**Respuesta exitosa**:
* C??digo: 200 (OK).
* Cuerpo: `undefined`.

**Error `invalid_form`**:
* Descripci??n: este error ocurre cuando el valor del campo `rank` del formulario no es uno de los permitidos.
* C??digo: 400 (Bad Request).
* Cuerpo:
```json
{
   "what": "invalid_form"
}
```

**Error `insufficient_permissions`**:
* Descripci??n: este error ocurre cuando el usuario que hace la consulta no cuenta con un rango de administrador.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

**Error `user_does_not_exist`**:
* Descripci??n: este error ocurre cuando el usuario que se intenta promover no exite.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "user_does_not_exist"
}
```

#### `/user/banish`

**Descripci??n**: permite bloquear el acceso a un usuario. Adem??s, agrega su direcci??n de *email* a una lista negra para que pueda usarse para crear una nueva cuenta.

**M??todo**: `PUT`.

**Formulario**:
```json
{
   "aliasOrEmail": "string",
   "reason": "string"
}
```
El campo `aliasOrEmail` es el alias o el email del usuario a bloquear y `reason` es un campo opcional que detalla la raz??n del bloqueo.

**Respuesta exitosa**:
* C??digo: 200 (OK).
* Cuerpo: `undefined`.

**Error `insufficient_permissions`**:
* Descripci??n: este error ocurre cuando el usuario no tiene rango de moderador ni de administrador o cuando se intenta bloquear a un usuario de mayor rango.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

**Error `user_does_not_exist`**:
* Descripci??n: este error ocurre cuando el usuario que se intenta bloquear no existe.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "user_does_not_exist"
}
```

#### `/user/remove-banishment`

**Descripci??n**: elimina el bloqueo de acceso a un usuario. Si el usuario no existe, de todas formas se quitar?? su direcci??n de correo electr??nico de la lista negra.

**M??todo**: `PUT`.

**Formulario**:
```json
{
   "email": "string"
}
```
Se identifica al usuario por su correo electr??nico, ya que su cuenta puede que haya sido eliminada.

**Respuesta exitosa**:
* C??digo: 200 (OK).
* Cuerpo: `undefined`.

**Error `insufficient_permissions`**:
* Descripci??n: este error ocurre cuando el usuario no tiene rango de moderador ni de administrador o cuando el usuario que se intenta desbloquar ha sido bloqueado por un usuario con un rango superior.
* C??digo: 401 (Unauthorized).
* Cuerpo:
```json
{
   "what": "insufficient_permissions"
}
```

**Error `user_does_not_exist`**:
* Descripci??n: este error ocurre cuando el usuario que se intenta desbloquear no existe.
* C??digo: 409 (Conflict).
* Cuerpo:
```json
{
   "what": "user_does_not_exist"
}
```

#### `/user/banishment-list`

**Descripci??n**: accede a una lista con los datos de los usuarios bloqueados del servidor.

**M??todo**: `GET`.

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
El campo `judgeId` es opcional y permite filtrar los resultados seg??n el identificador del moderador o administrador encargado del bloqueo.

**Respuesta exitosa**:
* C??digo: 200 (OK).
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
Si el usuario ha sido eliminado, entonces el campo `user` ser?? un objeto vac??o.

### Upload API

La ruta para subir im??genes es `/upload/image`. Todas las im??genes deben enviarse de una en una y deben ocupar un campo de formulario con el nombre `image`. Si la petici??n es exitosa, se devuelve el enlace a la imagen almacenada en Cloudinary.