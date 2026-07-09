export const boxType = <T>() => null as T

export interface TypeDef<TsType> {
    tsType: TsType
}

export type TypeCollection = Record<string , TypeDef<any>>

export const commonTypeDefs = {
    text       : {tsType: boxType<string>()},
    integer    : {tsType: boxType<number>()},
    boolean    : {tsType: boxType<boolean>()},
} satisfies TypeCollection;

export type FieldDef<TypeDefs extends TypeCollection = typeof commonTypeDefs> = {
    type: keyof TypeDefs
    label?: string
    nullable?: boolean
    description?: string
}

export type FieldInfo<TypeDefs extends TypeCollection = typeof commonTypeDefs> = Required<FieldDef<TypeDefs>>

export type RecordDef<TypeDefs extends TypeCollection = typeof commonTypeDefs> = Record<string, FieldDef<TypeDefs>>

// export type RecordInfo<TypeDefs extends TypeCollection = typeof commonTypeDefs> = Required<RecordDef<TypeDefs>>
export type RecordInfo<TypeDefs extends TypeCollection = typeof commonTypeDefs> = Record<string, FieldInfo<TypeDefs>>

export function completeRecord<TypeDefs extends TypeCollection = typeof commonTypeDefs>(recordDef: RecordDef<TypeDefs>): RecordInfo<TypeDefs>{
    return Object.fromEntries(Object.entries(recordDef).map(([name, fieldDef]) => ([name, {
        ...fieldDef,
        label: fieldDef.label ?? name.replace(/_/g,' '),
        nullable: fieldDef.nullable ?? true,
        description: fieldDef.description ?? '',
    }])));
}

export type RecordInstanceType<TTypeCollection extends TypeCollection, TRecordDef extends RecordDef<TTypeCollection>> = {
    [K in keyof TRecordDef]: TTypeCollection[TRecordDef[K]['type']]['tsType']
}

