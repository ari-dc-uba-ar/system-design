<!-- multilang from README.md




NO MODIFIQUE ESTE ARCHIVO. FUE GENERADO AUTOMÁTICAMENTE POR multilang.js




-->
<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

# system-design

Capa descriptiva para sistemas diseñados alrededor de una única fuente de verdad (SSOT).

Este módulo provee el vocabulario para describir un sistema — tipos de dominio, entidades,
campos, procedimientos — como valores fuertemente tipados y serializables. A partir de esas
descripciones, generadores de código o implementaciones on-the-fly pueden derivar los scripts
de creación de tablas, los endpoints CRUD con su capa de base de datos, las pantallas del
frontend, los serializadores en ambos sentidos, los validadores de tipo, etc.

Este módulo cubre solo la parte descriptiva de los sistemas: no genera nada por sí mismo.

## Estructura

* `src/common`: el framework descriptor; no conoce ningún sistema concreto.
* `examples/common`: un sistema de ejemplo (sistema de alumnos) descripto con el framework.

## Estado

En etapa de diseño.

## Licencia

[MIT](LICENSE)
