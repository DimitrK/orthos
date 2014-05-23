var enyo = enyo,
    describe = describe,
    it = it,
    spyOn = spyOn,
    expect = expect,
    dillema = dillema;
/***
* Formats the data for the validator's validate function.
*/

describe("The orthos.Validatable ", function() {
    
    it("should be a function", function() {
        expect(typeof orthos.Validatable).toEqual("function");
    });

    describe("upon user keypress - entering a string, it ", function() {
        var validator, USERINPUT;
        USERINPUT = "hey";
        beforeEach(function() {
            validator = spec.create("required", "");
            spyOn(validator, 'validate').andCallThrough();
            spyOn(validator, '_handleKeyPress').andCallThrough();
            spec.render();
        });
        it("should call .validate once when he finished typing.",  function() {
            spec.keyPress(USERINPUT);
            waits(2500);
            runs(function() {
                expect(validator.validate.callCount).toEqual(1);
                expect(validator.validate).toHaveBeenCalled();
            });
        });
        it("should call ._handleKeyPress as many times as the chars entered by user.",  function() {
            spec.keyPress(USERINPUT);
            waits(1650);
            runs(function() {
                expect(validator._handleKeyPress.callCount).toEqual(USERINPUT.length);
            });
        });
        it("should not call .validate at all after user finished typing when `live` published property set to false (default:true).",  function() {
            validator.set("live", false);
            spec.keyPress(USERINPUT);
            waits(1650);
            runs(function() {
                expect(validator.validate).not.toHaveBeenCalled();
            });
        });
    });
    describe(".isValid()", function() {
        it("should call .validate() if form was never validated.", function() {
            var validator = new orthos.Validatable();
            spyOn(validator, 'validate').andCallThrough();
            validator.isValid();
            expect(validator.validate).toHaveBeenCalled();
        });
        it("should not call .validate() if form was already validated and no change occured.", function() {
            var validator = new orthos.Validatable();
            validator.validate();
            spyOn(validator, 'validate').andCallThrough();
            validator.isValid();
            expect(validator.validate).not.toHaveBeenCalled();
        });
        it("should be true when .validate() was called with no params.", function() {
            var validator = new orthos.Validatable();
            validator.validate();
            expect(validator.isValid()).toBeTruthy();
        });
        it("should be true when .validate() was called with correct params.", function() {
            var validator = spec.create("number", 5);
            spec.create("alphanumeric", "test123", validator);
            spec.create("email", "mailme@tes.com", validator);
            spec.create("required", "a", validator);
            validator.validate();
            expect(validator.isValid()).toBeTruthy();
        });
        it("should be false when there are errors.", function() {
            var validator = new orthos.Validatable();
            spyOn(validator, "validate").andCallFake(function() {
                this.errors = {
                    err1: "There is error1"
                };
            });
            validator.validate();
            expect(validator.isValid()).toBeFalsy();
        });
    });

    describe(".getErrorsArray()", function() {
        it("should return an empty array when there are no errors", function() {
            var errorsArray;
            var validator = new orthos.Validatable();
            spyOn(validator, "validate").andCallFake(function() {
                this.errors = {};
            });
            validator.validate();
            errorsArray = validator.getErrorsArray();
            expect(errorsArray.length).toEqual(0);
            expect(errorsArray instanceof Array).toBeTruthy();
        });
        it("should return an array with equal number of elements as the existing errors (3)", function() {
            var validator = new orthos.Validatable();
            spyOn(validator, "validate").andCallFake(function() {
                this.errors = {
                    err1: "There is error1",
                    err2: "There is error1",
                    err3: "There is error3"
                };
            });
            validator.validate();
            expect(validator.getErrorsArray().length).toEqual(3);
        });
    });

    describe(".getErrorsHtml()", function() {
        it("should return an empty string when there are no errors", function() {
            var validator = new orthos.Validatable();
            spyOn(validator, "validate").andCallFake(function() {
                this.errors = {};
            });
            validator.validate();
            expect(validator.getErrorsHtml()).toBe("");
        });
        it("should return a HTML list of elements (3)", function() {
            var validator = new orthos.Validatable();
            spyOn(validator, "validate").andCallFake(function() {
                this.errors = {
                    err1: ["There is error1"],
                    err2: ["There is error2"],
                    err3: ["There is error3"]
                };
            });
            validator.validate();
            expect(validator.getErrorsHtml()).toBe("<ul><li>Err1 There is error1</li><li>Err2 There is error2</li><li>Err3 There is error3</li></ul>");
        });
    });
    describe(".changeContorlValidation()", function() {
        it("should validate a `required` empty Input element as invalid but then as valid when the input changed to `optional`", function() {
            var validator = spec.create("required", undefined);
            expect(validator.isValid()).toBeFalsy();
            validator.changeContorlValidation(spec.last, "optional", "required");
            expect(validator.isValid()).toBeTruthy();
        });
        it("should just add a validation if none is passed for replacement ", function(){
            var validator = spec.create("required", "something");
            validator.changeContorlValidation(spec.last, "email", undefined); // undefined-none passed to replace
            expect(spec.last.is).toEqual("required email");
        });
        it("should just add a validation if the validation to be replaced is not present ", function(){
            var validator = spec.create("required", "something");
            validator.changeContorlValidation(spec.last, "email", "notexisting");
            expect(spec.last.is).toEqual("required email");
        });
    });
    describe("after validation ", function() {
        describe("should add to element", function(){
            it("the class `orthos-validation-success` and removes class `orthos-validation-error` when element's value validates as valid while was invalid", function() {
                var validator = spec.create("required", undefined);
                var $el = spec.last;
                expect(validator.isValid()).toBeFalsy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("orthos-validation-error")).toBeTruthy();
                $el.setValue("something");
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
                expect($el.hasClass("orthos-validation-success")).toBeTruthy();
                expect($el.hasClass("orthos-validation-error")).toBeFalsy();
            });
            it("the class `orthos-validation-error` only when element's value is invalid", function() {
                var validator = spec.create("required", undefined);
                var $el = spec.last;
                expect(validator.isValid()).toBeFalsy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("orthos-validation-error")).toBeTruthy();
            });
            it("the class `orthos-validation-error` and removes `orthos-validation-success` when element's value validates as valid while was invalid", function() {
                var validator = spec.create("required", "somedata");
                var $el = spec.last;
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
                expect($el.hasClass("orthos-validation-success")).toBeTruthy();
                expect($el.hasClass("orthos-validation-error")).toBeFalsy();
                $el.setValue(undefined);
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("orthos-validation-error")).toBeTruthy();
            });
            it("a custom class `custom-error`, set from `errorClass` published property when element's value is invalid", function() {
                var validator = spec.create("required", undefined);
                validator.set("errorClass", "custom-error");
                var $el = spec.last;
                expect(validator.isValid()).toBeFalsy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("custom-error")).toBeTruthy();
            });
            it("a custom class `custom-success`, set from `successClass` published property when element's value is invalid", function() {
                var validator = spec.create("required", "sometext");
                validator.set("successClass", "custom-success");
                var $el = spec.last;
                expect(validator.isValid()).toBeTruthy();
                expect($el.hasClass("custom-success")).toBeTruthy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
            });
        });
        describe("should not add to element", function(){
            it("neither `orthos-validation-success` or `orthos-validation-error` classes when there is no validation defined", function() {
                var validator = spec.create(undefined, undefined);
                validator.validate();
                expect(spec.last.hasClass("orthos-validation-success")).toBeFalsy();
                expect(spec.last.hasClass("orthos-validation-error")).toBeFalsy();
            });
            it("no class when validation is valid but `withClasses` publised property is set to false (default:true)", function() {
                var validator = spec.create("required", "testing");
                validator.set("withClasses", false);
                expect(validator.isValid()).toBeTruthy();
                expect(spec.last.hasClass("orthos-validation-success")).toBeFalsy();
                expect(spec.last.hasClass("orthos-validation-error")).toBeFalsy();
            });
            it("no class when validation is invalid but `withClasses` publised property is set to false (default:true)", function() {
                var validator = spec.create("required", undefined);
                validator.set("withClasses", false);
                expect(validator.isValid()).toBeFalsy();
                expect(spec.last.hasClass("orthos-validation-success")).toBeFalsy();
                expect(spec.last.hasClass("orthos-validation-error")).toBeFalsy();
            });
        });
    });

    describe("validating ", function() {
        describe("number", function() {
            it("as valid for input a number", function() {
                var validator = spec.create("number", 5);
                expect(validator.isValid()).toBeTruthy();
            });
            it("as invalid for input undefined", function() {
                var validator = spec.create("number", undefined);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input null", function() {
                var validator = spec.create("number", null);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input string", function() {
                var validator = spec.create("number", "string@str.com");
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input object", function() {
                var validator = spec.create("number", {
                    x: "test"
                });
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input array", function() {
                var validator = spec.create("number", ["test"]);
                expect(validator.isValid()).toBeFalsy();
            });
        });

        describe("email", function() {
            it("as valid for input a valid email", function() {
                var validator = spec.create("email", "jim.feedback@gmail.com");
                expect(validator.isValid()).toBeTruthy();
            });
            it("as invalid for input a email without domain", function() {
                var validator = spec.create("email", "jim.feedback@.com");
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input a email without dot-post-fix", function() {
                var validator = spec.create("email", "jim.feedback@gmail.");
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input a number", function() {
                var validator = spec.create("email", 5);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input undefined", function() {
                var validator = spec.create("email", undefined);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input null", function() {
                var validator = spec.create("email", null);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input string", function() {
                var validator = spec.create("email", "string");
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input object", function() {
                var validator = spec.create("email", {
                    x: "test"
                });
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input array", function() {
                var validator = spec.create("email", ["test"]);
                expect(validator.isValid()).toBeFalsy();
            });
        });

        describe("alphanumeric", function() {
            it("as valid for input alphanumeric string", function() {
                var validator = spec.create("alphanumeric", "abcdABCD01234_");
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input number", function() {
                var validator = spec.create("alphanumeric", 0);
                expect(validator.isValid()).toBeTruthy();
            });
            it("as invalid for input any non alphanumeric string", function() {
                var validator = spec.create("alphanumeric", "abc!@ASD234(");
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input object", function() {
                var validator = spec.create("alphanumeric", {
                    x: "test"
                });
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input array", function() {
                var validator = spec.create("alphanumeric", ["test", "test2"]);
                expect(validator.isValid()).toBeFalsy();
            });
        });

        describe("alphabetical", function() {
            it("as valid for input alphabetical string", function() {
                var validator = spec.create("alphabetical", "abcdABCD");
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input number zero", function() {
                var validator = spec.create("alphabetical", 0);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as valid for input any number", function() {
                var validator = spec.create("alphabetical", 34);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as valid for input alphanumeric string", function() {
                var validator = spec.create("alphabetical", "abcdABCD12345");
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input any non alphabetical string", function() {
                var validator = spec.create("alphabetical", "abc!@ASD234(");
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input object", function() {
                var validator = spec.create("alphabetical", {
                    x: "test"
                });
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input array", function() {
                var validator = spec.create("alphabetical", ["test", "test2"]);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input undefined", function() {
                var validator = spec.create("alphabetical", undefined);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input null", function() {
                var validator = spec.create("alphabetical", null);
                expect(validator.isValid()).toBeFalsy();
            });
        });
        
        describe("required", function() {
            it("as valid for any string", function() {
                var validator = spec.create("required", "abc!@ASD234(");
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input number", function() {
                var validator = spec.create("required", 0);
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input object", function() {
                var validator = spec.create("required", {
                    x: "test"
                });
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input array", function() {
                var validator = spec.create("required", ["test", "test2"]);
                expect(validator.isValid()).toBeTruthy();
            });
            it("as invalid for input undefined", function() {
                var validator = spec.create("required", undefined);
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid for input null", function() {
                var validator = spec.create("required", null);
                expect(validator.isValid()).toBeFalsy();
            });
        });
        
        describe("optional", function() {
            it("as valid for any string", function() {
                var validator = spec.create("optional", "abc!@ASD234(");
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input number", function() {
                var validator = spec.create("optional", 0);
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input object", function() {
                var validator = spec.create("optional", {
                    x: "test"
                });
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input array", function() {
                var validator = spec.create("optional", ["test", "test2"]);
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input undefined", function() {
                var validator = spec.create("optional", undefined);
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid for input null", function() {
                var validator = spec.create("optional", null);
                expect(validator.isValid()).toBeTruthy();
            });
        });
    });
    
    describe("evaluating the constrain of", function() {

        describe("min against input length", function() {
            it("as valid when a string length(4) is longer than the given value(2)", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.min = 2;
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid when a string length(4) is longer equal the given value(4)", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.min = 4;
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
            });
            it("as invalid when a string length(4) is longer less than the given value(5)", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.min = 5;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the given value is undefined", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.min = undefined;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the given value is a string", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.min = "string";
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
        });

        describe("max against input length", function() {
            it("as valid when a string length(4) is less than the constrain value(5)", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.max = 5;
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
            });
            it("as valid when a string length(4) is equal the constrain value(4)", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.max = 4;
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
            });
            it("as invalid when a string length(4) is longer than the constrain value(2)", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.max = 2;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain value is undefined", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.max = undefined;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain value is a string", function() {
                var validator = spec.create("alphanumeric", "test");
                spec.last.max = "string";
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
        });
        describe("gt against input value", function() {
            it("as valid when an input number(10) is greater than constrain number(1)", function() {
                var validator = spec.create("number", 10);
                spec.last.gt = 1;
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
            });
            it("as invalid when an input number(10) is equal with the constrain number(10)", function() {
                var validator = spec.create("number", 10);
                spec.last.gt = 10;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when an input number(10) is less than constrain number(11)", function() {
                var validator = spec.create("number", 10);
                spec.last.gt = 11;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is undefined", function() {
                var validator = spec.create("number", 10);
                spec.last.gt = undefined;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is a string", function() {
                var validator = spec.create("number", 10);
                spec.last.gt = "string";
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
        });
        describe("lt against input value", function() {
            it("as valid when an input number(10) is less than constrain number(11)", function() {
                var validator = spec.create("number", 10);
                spec.last.lt = 11;
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
            });
            it("as invalid when an input number(10) is greater than constrain number(1)", function() {
                var validator = spec.create("number", 10);
                spec.last.lt = 1;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when an input number(10) is equal with the constrain number(10)", function() {
                var validator = spec.create("number", 10);
                spec.last.lt = 10;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is undefined", function() {
                var validator = spec.create("number", 10);
                spec.last.lt = undefined;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is a string", function() {
                var validator = spec.create("number", 10);
                spec.last.lt = "string";
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
        });
        describe("eq against input value", function() {
            it("as valid when an input number(10) is equal with the constrain number(10)", function() {
                var validator = spec.create("number", 10);
                spec.last.eq = 10;
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
            });
            it("as invalid when an input number(10) is less than constrain number(11)", function() {
                var validator = spec.create("number", 10);
                spec.last.eq = 11;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when an input number(10) is greater than constrain number(1)", function() {
                var validator = spec.create("number", 10);
                spec.last.eq = 1;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is undefined", function() {
                var validator = spec.create("number", 10);
                spec.last.eq = undefined;
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is a string", function() {
                var validator = spec.create("number", 10);
                spec.last.eq = "string";
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
        });
        
        describe("sameas", function() {
            it("as valid while it has the same value with the element it points to by name.", function() {
                var validator = spec.create("required", "nickname");
                var $elTarget = spec.last;
                $elTarget.setName("username");
                spec.create("required", "nickname", validator);
                spec.last.sameas = "username";
                spec.render();
                validator.validate();
                expect(validator.isValid()).toBeTruthy();
            });

            it("as invalid while it has  different value than the element it points to by name.", function() {
                var validator = spec.create("required", "nickname");
                var $elTarget = spec.last;
                $elTarget.setName("username");
                spec.create("required", "differentname", validator);
                spec.last.sameas = "username";
                spec.render();
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
            it("as invalid while it has no value set unlike the element it points to by name.", function() {
                var validator = spec.create("required", "nickname");
                var $elTarget = spec.last;
                $elTarget.setName("username");
                spec.create("required", undefined, validator);
                spec.last.sameas = "username";
                spec.render();
                validator.validate();
                expect(validator.isValid()).toBeFalsy();
            });
        });
    });
});