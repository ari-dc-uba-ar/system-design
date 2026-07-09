# system-design
Descriptive layer for systems designed around a Single Source of Truth (SSOT).


language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)


## Goal

Descriptive layer for systems designed around a Single Source of Truth (SSOT).

This module provides the vocabulary to describe a system — domain types, entities, fields,
procedures — as strongly typed, serializable values. From those descriptions, code generators
or on-the-fly implementations can derive the table creation scripts, the CRUD endpoints with
their database layer, the frontend screens, the serializers in both directions, the type
validators, and so on.

This module covers only the descriptive part of systems: it does not generate anything itself.

## Structure

* `src/common`: the descriptive framework; it knows nothing about any concrete system.
* `examples/common`: an example system (a students system) described with the framework.

## Status

Design stage.

## License

[MIT](LICENSE)
