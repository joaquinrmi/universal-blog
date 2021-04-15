# Universal Blog

![Universal Blog](https://user-images.githubusercontent.com/28006144/114746149-c9cdf180-9d25-11eb-8fbe-dd39e14802c7.png)

Servidor "universal" para blogs desarrollado con **Node.js** y **PostgreSQL**.

## Variables de entorno

Para el funcionamiento de la aplicación, habrá que establecer previamente las siguientes variables de entorno del servidor.
* `SERVER_NAME`: es el nombre de la aplicación.
* `PORT`: es el número de puerto que se le asignará al servidor.
* `SESSION_SECRET`: es el *secret* utilizado por `express-session`.
* `ENCRYPT_SECRET`: es la clave que se usará para encriptar las contraseñas.
* `TITLE_ENCRYPT_SECRET`: es la clave que se usará para encriptar los títulos de las publicaciones, con el fin de generar un identificador.
* `PGHOST`, `PGUSER`, `PGDATABASE`, `PGPASSWORD` y `PGPORT`: son los parámetros de conexión con la base de datos de **PostgreSQL**.
* `CLOUD_NAME`, `CLOUD_API_KEY` y `CLOUD_API_SECRET`: son los parámetros de conexión con el servidor de **Cloudinary**.

## API

La API se divide en tres partes: `account`, que administra los servicios relacionados con las cuentas de usuario; `post`, que administra las acciones con publicaciones y `upload` que permite cargar imágenes.

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

**Respuesta**:
```json
{
   "alias": "string"
}
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

**Respuesta**:
```json
{
   "postId": "string"
}
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

### Upload API

La ruta para subir imágenes es `/upload/image`. Todas las imágenes deben enviarse de una en una y deben ocupar un campo de formulario con el nombre `image`. Si la petición es exitosa, se devuelve el enlace a la imagen almacenada en Cloudinary.