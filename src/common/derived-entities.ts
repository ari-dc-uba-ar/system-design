import {
    TypeCollection, FieldInfo, FkInfo, EntityDef, EntityInfoOf, completeEntity,
} from "./system-design";

/* GridInfo generalizes EntityInfo: {fields, pk, fks, uks} is what a generic grid
   frontend/data-layer needs (reorder, filter, hide/show columns, edit what's editable),
   regardless of whether the entity is basic or derived. EntityInfo is the case
   GridInfo<FieldInfo>: no alias is declared here on purpose, the structural match is
   the point (see "GridInfo as the common interface" test). */
export type GridInfo<TColumn extends FieldInfo<TypeCollection> = FieldInfo> = {
    fields: Record<string, TColumn>
    pk: readonly string[]
    fks: Readonly<Record<string, FkInfo>>
    uks: Readonly<Record<string, readonly string[]>>
}

/* a column pulled in from the target entity of an outgoing fk. The origin is not a new
   alias: originFk is the same key already used to disambiguate the fk (ej: presidente/vocal
   → docentes) and originField is the field name in the target entity. */
export type AugmentedColumnInfo<TypeDefs extends TypeCollection = TypeCollection> = FieldInfo<TypeDefs> & {
    originFk: string
    originField: string
    visible: boolean
}

type TargetEntityOf<
    TEntities extends Record<string, EntityDef<TypeCollection>>,
    TBase extends keyof TEntities,
    TFkName extends keyof NonNullable<TEntities[TBase]['fks']>,
> = TEntities[NonNullable<TEntities[TBase]['fks']>[TFkName]['entity'] & keyof TEntities]

/* one column per field of the target entity, keyed as `${fkName}__${targetField}` so it
   can't collide with the base entity's own fields, and typed with the target field's
   literal type — same precision as EntityInfoOf, just reached through a fk instead of a Def. */
type AugmentedFieldsOf<
    TEntities extends Record<string, EntityDef<TypeCollection>>,
    TBase extends keyof TEntities & string,
    TFkName extends keyof NonNullable<TEntities[TBase]['fks']> & string,
> = {
    [K in keyof TargetEntityOf<TEntities, TBase, TFkName>['fields'] & string as `${TFkName}__${K}`]:
        AugmentedColumnInfo & {type: TargetEntityOf<TEntities, TBase, TFkName>['fields'][K]['type']}
}

export type AugmentedGridInfo<
    TEntities extends Record<string, EntityDef<TypeCollection>>,
    TBase extends keyof TEntities & string,
    TFkName extends keyof NonNullable<TEntities[TBase]['fks']> & string,
> = {
    fields: EntityInfoOf<TEntities[TBase]>['fields'] & AugmentedFieldsOf<TEntities, TBase, TFkName>
    pk: EntityInfoOf<TEntities[TBase]>['pk']
    fks: EntityInfoOf<TEntities[TBase]>['fks']
    uks: EntityInfoOf<TEntities[TBase]>['uks']
}

/* augments baseEntity with the fields of the entity targeted by fkName: the isName fields
   of the target are shown (visible), the rest are hidden but still requestable/filterable.
   Pulled-in fields are read-only (editable: false): they belong to another entity's row. */
export function augmentEntityByFk<
    TEntities extends Record<string, EntityDef<TypeCollection>>,
    TBase extends keyof TEntities & string,
    TFkName extends keyof NonNullable<TEntities[TBase]['fks']> & string,
>(
    entities: TEntities,
    baseEntity: TBase,
    fkName: TFkName,
): AugmentedGridInfo<TEntities, TBase, TFkName> {
    const base = completeEntity(entities[baseEntity]);
    const fk = (base.fks as Record<string, FkInfo>)[fkName];
    const target = completeEntity(entities[fk.entity] as EntityDef<TypeCollection>);
    const augmentedFields: Record<string, AugmentedColumnInfo> = {};
    for (const originField in target.fields) {
        const targetField = target.fields[originField];
        augmentedFields[`${fkName}__${originField}`] = {
            ...targetField,
            editable: false,
            visible: targetField.isName,
            originFk: fkName,
            originField,
        };
    }
    return {
        fields: {...base.fields, ...augmentedFields},
        pk: base.pk,
        fks: base.fks,
        uks: base.uks,
    } as AugmentedGridInfo<TEntities, TBase, TFkName>;
}
