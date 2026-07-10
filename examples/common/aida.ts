/* EJEMPLO del sistema de alumnos */

import {
    boxType, commonTypeDefs,
    RecordDef, defineEntity, extractPk
} from "../../src/common/system-design";

type Fecha = {año: number, mes: number, día:number}

export var typeDefs = {
    ...commonTypeDefs,
    fecha: {tsType: boxType<Fecha>()},
    email: commonTypeDefs.text
}

type RecordsDef = RecordDef<typeof typeDefs>

export const cargo = {
    cargo            : {type: 'text' },
    denominacion     : {type: 'text' , label:'denominación'},
    orden            : {type: 'integer'},
    puede_dirigir    : {type: 'boolean'},

} satisfies RecordsDef

export const materia = {
    materia          : {type: 'text'   },
    denominacion     : {type: 'text'   , label:'denominación', nullable: false, description: 'si corresponde a más de una carrera, aclarar en el nombre'},
} satisfies RecordsDef

export const docente = {
    docente          : {type: 'text' },
    apellido         : {type: 'text' , nullable:false},
    nombres          : {type: 'text' , nullable:false},
    cargo            : {type: 'text' },
    email            : {type: 'email'},
    email_alternativo: {type: 'email'},
} satisfies RecordsDef

export const asignacion = {
    docente: docente.docente,
    materia: materia.materia,
    cargo  : cargo.cargo,
} satisfies RecordsDef

export const periodo = {
    periodo          : {type: 'text' , description: 'bimestre, cuatrimestre, etc...'},
} satisfies RecordsDef

/* entities: plural names wrap the singular record defs */

export const docentes = defineEntity({pk: ['docente'], fields: docente})
export const materias = defineEntity({pk: ['materia'], fields: materia})
export const periodos = defineEntity({pk: ['periodo'], fields: periodo})

export const curso = {
    ...extractPk(periodos),
    ...extractPk(materias),
    ...extractPk(docentes), // docente responsable del curso
} satisfies RecordsDef

export const cursos = defineEntity({pk: ['periodo', 'materia'], fields: curso})

export const clase = {
    ...extractPk(cursos),
    orden            : {type: 'integer'},
    fecha            : {type: 'fecha'  },
    tema             : {type: 'text'   },
} satisfies RecordsDef

export const clases = defineEntity({pk: [...cursos.pk, 'orden'], fields: clase})

export const recordDefs = {
    cargo,
    docente,
    materia,
    asignacion,
    periodo,
    curso,
    clase,
}

export const entityDefs = {
    docentes,
    materias,
    periodos,
    cursos,
    clases,
}
