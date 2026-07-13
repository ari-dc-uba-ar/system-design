import * as assert from "assert";

import { completeEntity, FieldInfo } from "../src/common/system-design";
import { GridInfo, AugmentedColumnInfo, augmentEntityByFk } from "../src/common/derived-entities";
import { cursos, entityDefs } from "../examples/common/aida";

describe("GridInfo as the common interface", function(){
    it("accepts a basic entity's EntityInfo as-is: no conversion needed", function(){
        // GridInfo is a generalization, not a parallel Def/Info pair: the direction that
        // matters is EntityInfo -> GridInfo (any EntityInfo already IS one); the literal
        // per-field keys GridInfo forgets on purpose are not expected to come back.
        var materiasInfo = completeEntity(entityDefs.materias);
        var asGrid: GridInfo = materiasInfo;
        assert.deepStrictEqual(asGrid, materiasInfo);
    })
})

describe("entity augmented by an outgoing fk", function(){
    it("shows the isName fields of the target, hides the rest, marks them read-only", function(){
        var augmented = augmentEntityByFk(entityDefs, 'cursos', 'materias');
        // literal keys, typed exactly like EntityInfoOf: fkName__targetField
        var materiaColumn: AugmentedColumnInfo & {type: 'text'} = augmented.fields.materias__materia;
        var denominacionColumn: AugmentedColumnInfo & {type: 'text'} = augmented.fields.materias__denominacion;
        // @ts-expect-error the target entity (materias) has no 'inexistente' field
        var noField = augmented.fields.materias__inexistente;
        assert.equal(materiaColumn.visible, false);
        assert.equal(denominacionColumn.visible, true);
        assert.equal(materiaColumn.editable, false);
        assert.equal(denominacionColumn.editable, false);
        assert.equal(materiaColumn.originFk, 'materias');
        assert.equal(materiaColumn.originField, 'materia');
        assert.equal(denominacionColumn.originFk, 'materias');
        assert.equal(denominacionColumn.originField, 'denominacion');
        assert.equal(noField, undefined);
    })
    it("keeps the base entity's own fields untouched, editable by default", function(){
        var augmented = augmentEntityByFk(entityDefs, 'cursos', 'materias');
        assert.deepStrictEqual(augmented.pk, cursos.pk);
        assert.equal(augmented.fields.periodo.editable, true);
        assert.equal(augmented.fields.materia.editable, true);
        // the base field is untouched: it has no origin metadata
        // @ts-expect-error 'originFk' does not exist on the base entity's own field
        var noOrigin = augmented.fields.periodo.originFk;
        assert.equal(noOrigin, undefined);
    })
    it("is 100% compatible with GridInfo", function(){
        var augmented = augmentEntityByFk(entityDefs, 'cursos', 'materias');
        var asGrid: GridInfo<FieldInfo | AugmentedColumnInfo> = augmented;
        assert.deepStrictEqual(asGrid, augmented);
    })
})
