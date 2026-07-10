/* EJEMPLO del sistema de alumnos */

import {
    boxType, commonTypeDefs,
    RecordDef, defineEntity, extractPk, mergePk
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

export const alumno = {
    alumno           : {type: 'text' },
    apellido         : {type: 'text' , nullable:false},
    nombres          : {type: 'text' , nullable:false},
    email            : {type: 'email'},
} satisfies RecordsDef

export const alumnos = defineEntity({pk: ['alumno'], fields: alumno})

export const pregunta = {
    ...extractPk(clases),
    pregunta         : {type: 'integer'},
    formulacion      : {type: 'text'   , nullable:false, label: 'formulación', description: 'texto principal de la pregunta'},
    aclaraciones     : {type: 'text'   , description: 'texto que no necesita repetirse cuando se quiera referir a una pregunta por su formulación, pero que es necesario para aclarar el contexto o posibles ambigüedades de la pregunta'},
    tipo_respuesta   : {type: 'text'   , nullable:false, label: 'tipo'}
} satisfies RecordsDef

export const preguntas = defineEntity({pk: [...clases.pk, 'pregunta'], fields: pregunta})

export const opcion = {
    ...extractPk(preguntas),
    opcion           : {type: 'text'   },
    detalle          : {type: 'text'   },
} satisfies RecordsDef

export const opciones = defineEntity({pk: [...preguntas.pk, 'opcion'], fields: opcion})

export const inscripcion = {
    ...extractPk(cursos),
    ...extractPk(alumnos),
} satisfies RecordsDef

export const inscripciones = defineEntity({pk: [...cursos.pk, 'alumno'], fields: inscripcion})

/* combined pk: inscripciones and clases share periodo and materia, no repetition */

export const presencia = {
    ...extractPk(inscripciones),
    ...extractPk(clases),
} satisfies RecordsDef

export const presencias = defineEntity({pk: mergePk(inscripciones.pk, clases.pk), fields: presencia})

export const recordDefs = {
    cargo,
    docente,
    materia,
    asignacion,
    periodo,
    curso,
    clase,
    alumno,
    pregunta,
    opcion,
    inscripcion,
    presencia,
}

export const entityDefs = {
    docentes,
    materias,
    periodos,
    cursos,
    clases,
    alumnos,
    preguntas,
    opciones,
    inscripciones,
    presencias,
}
