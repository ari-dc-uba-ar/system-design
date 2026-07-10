import * as assert from "assert";

import { RecordInstanceType, completeRecord, defineEntity, extractPk, mergePk } from "../src/common/system-design";
import { typeDefs, cargo, materia, curso, clase, cursos, clases, opcion, opciones, inscripciones, presencia, presencias } from "../examples/common/aida";

describe("aida example", function(){
    it("deduces the record instance type", function(){
        type Cargo = {
            cargo        : string,
            denominacion : string,
            orden        : number,
            puede_dirigir: boolean
        }
        type CargoDeducido = RecordInstanceType<typeof typeDefs, typeof cargo>
        var jtp: Cargo = {
            cargo        : 'JTP',
            denominacion : 'Jefe de Trabajos Prácticos',
            orden        : 4,
            puede_dirigir: true,
        }
        // both assignments must compile: Cargo and CargoDeducido are mutually assignable
        var cargoDeducido: CargoDeducido = jtp;
        var obtained: Cargo = cargoDeducido;
        assert.deepStrictEqual(cargoDeducido, jtp);
        assert.deepStrictEqual(obtained, jtp);
    })
    it("completes a record def into a record info", function(){
        var materiaInfo = completeRecord(materia);
        assert.deepStrictEqual(materiaInfo, {
            materia      : {type: 'text', label: 'materia'     , nullable: true , description: ''},
            denominacion : {type: 'text', label: 'denominación', nullable: false, description: 'si corresponde a más de una carrera, aclarar en el nombre'},
        });
    })
    it("completes preserving the field set and the type literals", function(){
        var cargoInfo = completeRecord(cargo);
        // the type literals from the def must survive the completion:
        var cargoType: 'text' = cargoInfo.cargo.type;
        // @ts-expect-error
        cargoInfo.cargo.type = 'integer'
        assert.equal(cargoType, 'text');
        assert.throws(()=>{
            // @ts-expect-error Must know which fields exists
            var dummy = cargoInfo.inexistente.type
        })
        type CargoInfoExpected = {
            cargo        : {type: 'text'   , label: string, nullable: boolean, description: string},
            denominacion : {type: 'text'   , label: string, nullable: boolean, description: string},
            orden        : {type: 'integer', label: string, nullable: boolean, description: string},
            puede_dirigir: {type: 'boolean', label: string, nullable: boolean, description: string},
        }
        // both assignments must compile: expected and deduced are mutually assignable
        // (this also checks that label, nullable and description are required, not optional)
        var expected: CargoInfoExpected = cargoInfo;
        var deducedBack: typeof cargoInfo = expected;
        assert.deepStrictEqual(deducedBack, expected);
    })
})

describe("aida entities", function(){
    it("keeps the pk literal tuple, in both directions", function(){
        var cursosPk: readonly ['periodo', 'materia'] = cursos.pk;
        var cursosPkBack: typeof cursos.pk = cursosPk;
        var clasesPk: readonly ['periodo', 'materia', 'orden'] = clases.pk;
        var clasesPkBack: typeof clases.pk = clasesPk;
        assert.deepStrictEqual(cursosPk, ['periodo', 'materia']);
        assert.deepStrictEqual(clasesPk, ['periodo', 'materia', 'orden']);
        assert.deepStrictEqual(cursosPkBack, cursosPk);
        assert.deepStrictEqual(clasesPkBack, clasesPk);
    })
    it("rejects pk keys that are not keys of fields", function(){
        // @ts-expect-error 'inexistente' is not a field
        var wrong = defineEntity({pk: ['inexistente'], fields: materia});
        // @ts-expect-error a wrong key among valid ones is also rejected
        var wrong2 = defineEntity({pk: ['materia', 'inexistente'], fields: materia});
        // (the check is compile-time only: at runtime defineEntity is the identity)
        assert.deepStrictEqual(wrong.pk, ['inexistente']);
        assert.deepStrictEqual(wrong2.pk, ['materia', 'inexistente']);
    })
    it("extracts the pk fields with their exact types and order", function(){
        var cursosPkFields = extractPk(cursos);
        type CursosPkExpected = {
            periodo : {type: 'text', description: string},
            materia : {type: 'text'},
        }
        // both assignments must compile: expected and extracted are mutually assignable
        var expected: CursosPkExpected = cursosPkFields;
        var extractedBack: typeof cursosPkFields = expected;
        // @ts-expect-error 'docente' is not part of the pk
        var noDocente = cursosPkFields.docente;
        assert.deepStrictEqual(cursosPkFields, {periodo: curso.periodo, materia: curso.materia});
        assert.deepStrictEqual(Object.keys(cursosPkFields), ['periodo', 'materia']);
        assert.deepStrictEqual(extractedBack, expected);
        assert.equal(noDocente, undefined);
    })
    it("inherits pk fields into other entities", function(){
        // curso got all its fields from the periodos, materias and docentes pks:
        assert.deepStrictEqual(Object.keys(curso), ['periodo', 'materia', 'docente']);
        // clase extends the cursos pk with its own fields:
        assert.deepStrictEqual(Object.keys(clase), ['periodo', 'materia', 'orden', 'fecha', 'tema']);
        // the inherited fields keep their type literals:
        var periodoType: 'text' = clases.fields.periodo.type;
        // @ts-expect-error the literal is preserved, not widened to string
        var wrongType: 'integer' = clases.fields.periodo.type;
        assert.equal(periodoType, 'text');
        assert.equal(wrongType, 'text');
    })
    it("chains pk inheritance (clases → preguntas → opciones)", function(){
        var opcionesPk: readonly ['periodo', 'materia', 'orden', 'pregunta', 'opcion'] = opciones.pk;
        var opcionesPkBack: typeof opciones.pk = opcionesPk;
        assert.deepStrictEqual(opciones.pk, ['periodo', 'materia', 'orden', 'pregunta', 'opcion']);
        assert.deepStrictEqual(Object.keys(opcion), ['periodo', 'materia', 'orden', 'pregunta', 'opcion', 'detalle']);
        assert.deepStrictEqual(opcionesPkBack, opcionesPk);
    })
    it("merges overlapping pks without repeating (inscripciones + clases)", function(){
        // periodo and materia are in both pks and must appear once, in order
        var merged = mergePk(inscripciones.pk, clases.pk);
        var mergedExpected: readonly ['periodo', 'materia', 'alumno', 'orden'] = merged;
        var mergedBack: typeof merged = mergedExpected;
        assert.deepStrictEqual(merged, ['periodo', 'materia', 'alumno', 'orden']);
        // presencias uses that merge as its pk:
        var presenciasPk: readonly ['periodo', 'materia', 'alumno', 'orden'] = presencias.pk;
        assert.deepStrictEqual(presencias.pk, ['periodo', 'materia', 'alumno', 'orden']);
        // and the fields spread dedups the shared fields by itself:
        assert.deepStrictEqual(Object.keys(presencia), ['periodo', 'materia', 'alumno', 'orden']);
        assert.deepStrictEqual(presenciasPk, mergedBack);
        // the whole chain still deduces the instance type:
        type Presencia = RecordInstanceType<typeof typeDefs, typeof presencia>
        var unaPresencia: Presencia = {periodo: '2026-1c', materia: 'AlgoI', alumno: 'L1234', orden: 1};
        var presenciaBack: {periodo: string, materia: string, alumno: string, orden: number} = unaPresencia;
        assert.deepStrictEqual(presenciaBack, unaPresencia);
    })
})
