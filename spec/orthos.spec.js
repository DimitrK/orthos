var enyo = enyo,
    describe = describe,
    it = it,
    spyOn = spyOn,
    expect = expect,
    dillema = dillema;
/***
* Formats the data for the form's validate function.
*/

describe("An orthos.Validatable ", function() {
    
    it("should be a function", function() {
        expect(typeof orthos.Validatable).toEqual("function");
    });

    describe(".validate()", function(){
        it("should mark the whole form as validated, if was called without an argument", function(){
            var form = new orthos.Validatable();
            form.validate();
            expect(form._validated).toBeTruthy();
        });
        it("should mark the whole form as validated, if was called with argument the form", function(){
            var form = new orthos.Validatable();
            form.validate(form);
            expect(form._validated).toBeTruthy();
        });
        it("should not mark the whole form as validated, if was called with argument an Input belonging to the form", function(){
            var form = spec.init();
            var $inputEl;
            spec.create("required", "someinput");
            $inputEl = spec.last;
            form.validate($inputEl);
            expect(form._validated).toBeFalsy();
        });
    });
    describe(".isValid()", function() {
        it("should call .validate() if form was never validated.", function() {
            var form = new orthos.Validatable();
            spyOn(form, 'validate').andCallThrough();
            form.isValid();
            expect(form.validate).toHaveBeenCalled();
        });
        it("should not call .validate() if form was already validated and no change occured.", function() {
            var form = new orthos.Validatable();
            form.validate();
            spyOn(form, 'validate').andCallThrough();
            form.isValid();
            expect(form.validate).not.toHaveBeenCalled();
        });
        it("should be true when .validate() was called with no params.", function() {
            var form = new orthos.Validatable();
            form.validate();
            expect(form.isValid()).toBeTruthy();
        });
        it("should be true when .validate() was called with correct params.", function() {
            var form = spec.create("number", 5);
            spec.create("alphanumeric", "test123", form);
            spec.create("email", "mailme@tes.com", form);
            spec.create("required", "a", form);
            form.validate();
            expect(form.isValid()).toBeTruthy();
        });
        it("should be false when there are errors.", function() {
            var form = new orthos.Validatable();
            spyOn(form, "validate").andCallFake(function() {
                this.errors = {
                    err1: "There is error1"
                };
            });
            form.validate();
            expect(form.isValid()).toBeFalsy();
        });
    });

    describe(".getErrorsArray()", function() {
        it("should return an empty array when there are no errors", function() {
            var errorsArray;
            var form = new orthos.Validatable();
            spyOn(form, "validate").andCallFake(function() {
                this.errors = {};
            });
            form.validate();
            errorsArray = form.getErrorsArray();
            expect(errorsArray.length).toEqual(0);
            expect(errorsArray instanceof Array).toBeTruthy();
        });
        it("should return an array with equal number of elements as the existing errors (3)", function() {
            var form = new orthos.Validatable();
            spyOn(form, "validate").andCallFake(function() {
                this.errors = {
                    err1: "There is error1",
                    err2: "There is error1",
                    err3: "There is error3"
                };
            });
            form.validate();
            expect(form.getErrorsArray().length).toEqual(3);
        });
    });

    describe(".getErrorsHtml()", function() {
        it("should return an empty string when there are no errors", function() {
            var form = new orthos.Validatable();
            spyOn(form, "validate").andCallFake(function() {
                this.errors = {};
            });
            form.validate();
            expect(form.getErrorsHtml()).toBe("");
        });
        it("should return a HTML list of elements (3)", function() {
            var form = new orthos.Validatable();
            spyOn(form, "validate").andCallFake(function() {
                this.errors = {
                    err1: ["There is error1"],
                    err2: ["There is error2"],
                    err3: ["There is error3"]
                };
            });
            form.validate();
            expect(form.getErrorsHtml()).toBe("<ul><li>Err1 There is error1</li><li>Err2 There is error2</li><li>Err3 There is error3</li></ul>");
        });
    });
    describe(".changeContorlValidation()", function() {
        it("should validate a `required` empty Input element as invalid but then as valid when the input changed to `optional`", function() {
            var form = spec.create("required", undefined);
            expect(form.isValid()).toBeFalsy();
            form.changeContorlValidation(spec.last, "optional", "required");
            expect(form.isValid()).toBeTruthy();
        });
        it("should just add a validation if none is passed for replacement ", function(){
            var form = spec.create("required", "something");
            form.changeContorlValidation(spec.last, "email", undefined); // undefined-none passed to replace
            expect(spec.last.is).toEqual("required email");
        });
        it("should just add a validation if the validation to be replaced is not present ", function(){
            var form = spec.create("required", "something");
            form.changeContorlValidation(spec.last, "email", "notexisting");
            expect(spec.last.is).toEqual("required email");
        });
    });

    describe("upon user keypress - entering a string, it ", function() {
        var form, USERINPUT;
        USERINPUT = "hey";
        beforeEach(function() {
            form = spec.create("required", "");
            spyOn(form, 'validate').andCallThrough();
            spyOn(form, '_handleKeyPress').andCallThrough();
            spec.render();
        });
        it("should call .validate once when he finished typing.",  function() {
            spec.keyPress(USERINPUT);
            waits(2500);
            runs(function() {
                expect(form.validate.callCount).toEqual(1);
                expect(form.validate).toHaveBeenCalled();
            });
        });
        it("should call ._handleKeyPress as many times as the chars entered by user.",  function() {
            spec.keyPress(USERINPUT);
            waits(1650);
            runs(function() {
                expect(form._handleKeyPress.callCount).toEqual(USERINPUT.length);
            });
        });
        it("should not call .validate at all after user finished typing when `live` published property set to false (default:true).",  function() {
            form.set("live", false);
            spec.keyPress(USERINPUT);
            waits(1650);
            runs(function() {
                expect(form.validate).not.toHaveBeenCalled();
            });
        });
    });

    describe("after validation ", function() {
        describe("should add to element", function(){
            it("the class `orthos-validation-success` and removes class `orthos-validation-error` when element's value validates as valid while was invalid", function() {
                var form = spec.create("required", undefined);
                var $el = spec.last;
                expect(form.isValid()).toBeFalsy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("orthos-validation-error")).toBeTruthy();
                $el.setValue("something");
                form.validate();
                expect(form.isValid()).toBeTruthy();
                expect($el.hasClass("orthos-validation-success")).toBeTruthy();
                expect($el.hasClass("orthos-validation-error")).toBeFalsy();
            });
            it("the class `orthos-validation-error` only when element's value is invalid", function() {
                var form = spec.create("required", undefined);
                var $el = spec.last;
                expect(form.isValid()).toBeFalsy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("orthos-validation-error")).toBeTruthy();
            });
            it("the class `orthos-validation-error` and removes `orthos-validation-success` when element's value validates as valid while was invalid", function() {
                var form = spec.create("required", "somedata");
                var $el = spec.last;
                form.validate();
                expect(form.isValid()).toBeTruthy();
                expect($el.hasClass("orthos-validation-success")).toBeTruthy();
                expect($el.hasClass("orthos-validation-error")).toBeFalsy();
                $el.setValue(undefined);
                form.validate();
                expect(form.isValid()).toBeFalsy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("orthos-validation-error")).toBeTruthy();
            });
             it("the class `orthos-validation-error` in an `optional` Input when there is a wrong value but removes the class when element's value changes to empty", function() {
                var form = spec.create("optional number", "somedata");
                var $el = spec.last;
                form.validate();
                expect(form.isValid()).toBeFalsy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("orthos-validation-error")).toBeTruthy();
                $el.setValue("");
                form.validate();
                expect(form.isValid()).toBeTruthy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("orthos-validation-error")).toBeFalsy();
            });
             it("the class `orthos-validation-success` in an `optional` Input when there is a valid value but removes the class when element's value changes to empty", function() {
                var form = spec.create("optional number", 1821);
                var $el = spec.last;
                form.validate();
                expect(form.isValid()).toBeTruthy();
                expect($el.hasClass("orthos-validation-success")).toBeTruthy();
                expect($el.hasClass("orthos-validation-error")).toBeFalsy();
                $el.setValue("");
                form.validate();
                expect(form.isValid()).toBeTruthy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("orthos-validation-error")).toBeFalsy();
            });
            it("a custom class `custom-error`, set from `errorClass` published property when element's value is invalid", function() {
                var form = spec.create("required", undefined);
                form.set("errorClass", "custom-error");
                var $el = spec.last;
                expect(form.isValid()).toBeFalsy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
                expect($el.hasClass("custom-error")).toBeTruthy();
            });
            it("a custom class `custom-success`, set from `successClass` published property when element's value is invalid", function() {
                var form = spec.create("required", "sometext");
                form.set("successClass", "custom-success");
                var $el = spec.last;
                expect(form.isValid()).toBeTruthy();
                expect($el.hasClass("custom-success")).toBeTruthy();
                expect($el.hasClass("orthos-validation-success")).toBeFalsy();
            });
        });
        describe("should not add to element", function(){
            it("neither `orthos-validation-success` or `orthos-validation-error` classes when there is no validation defined", function() {
                var form = spec.create(undefined, undefined);
                form.validate();
                expect(spec.last.hasClass("orthos-validation-success")).toBeFalsy();
                expect(spec.last.hasClass("orthos-validation-error")).toBeFalsy();
            });
            it("no class when validation is valid but `withClasses` publised property is set to false (default:true)", function() {
                var form = spec.create("required", "testing");
                form.set("withClasses", false);
                expect(form.isValid()).toBeTruthy();
                expect(spec.last.hasClass("orthos-validation-success")).toBeFalsy();
                expect(spec.last.hasClass("orthos-validation-error")).toBeFalsy();
            });
            it("no class when validation is invalid but `withClasses` publised property is set to false (default:true)", function() {
                var form = spec.create("required", undefined);
                form.set("withClasses", false);
                expect(form.isValid()).toBeFalsy();
                expect(spec.last.hasClass("orthos-validation-success")).toBeFalsy();
                expect(spec.last.hasClass("orthos-validation-error")).toBeFalsy();
            });
        });
    });

    describe("validating ", function() {
        describe("number", function() {
            it("as valid for input a number", function() {
                var form = spec.create("number", 5);
                expect(form.isValid()).toBeTruthy();
            });
            it("as invalid for input undefined", function() {
                var form = spec.create("number", undefined);
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input null", function() {
                var form = spec.create("number", null);
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input string", function() {
                var form = spec.create("number", "string@str.com");
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input object", function() {
                var form = spec.create("number", {
                    x: "test"
                });
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input array", function() {
                var form = spec.create("number", ["test"]);
                expect(form.isValid()).toBeFalsy();
            });
        });

        describe("email", function() {
            it("as valid for input a valid email", function() {
                var form = spec.create("email", "jim.feedback@gmail.com");
                expect(form.isValid()).toBeTruthy();
            });
            it("as invalid for input a email without domain", function() {
                var form = spec.create("email", "jim.feedback@.com");
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input a email without dot-post-fix", function() {
                var form = spec.create("email", "jim.feedback@gmail.");
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input a number", function() {
                var form = spec.create("email", 5);
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input undefined", function() {
                var form = spec.create("email", undefined);
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input null", function() {
                var form = spec.create("email", null);
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input string", function() {
                var form = spec.create("email", "string");
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input object", function() {
                var form = spec.create("email", {
                    x: "test"
                });
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input array", function() {
                var form = spec.create("email", ["test"]);
                expect(form.isValid()).toBeFalsy();
            });
        });

        describe("alphanumeric", function() {
            it("as valid for input alphanumeric string", function() {
                var form = spec.create("alphanumeric", "abcdABCD01234_");
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input number", function() {
                var form = spec.create("alphanumeric", 0);
                expect(form.isValid()).toBeTruthy();
            });
            it("as invalid for input any non alphanumeric string", function() {
                var form = spec.create("alphanumeric", "abc!@ASD234(");
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input object", function() {
                var form = spec.create("alphanumeric", {
                    x: "test"
                });
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input array", function() {
                var form = spec.create("alphanumeric", ["test", "test2"]);
                expect(form.isValid()).toBeFalsy();
            });
        });

        describe("alphabetical", function() {
            it("as valid for input alphabetical string", function() {
                var form = spec.create("alphabetical", "abcdABCD");
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input number zero", function() {
                var form = spec.create("alphabetical", 0);
                expect(form.isValid()).toBeFalsy();
            });
            it("as valid for input any number", function() {
                var form = spec.create("alphabetical", 34);
                expect(form.isValid()).toBeFalsy();
            });
            it("as valid for input alphanumeric string", function() {
                var form = spec.create("alphabetical", "abcdABCD12345");
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input any non alphabetical string", function() {
                var form = spec.create("alphabetical", "abc!@ASD234(");
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input object", function() {
                var form = spec.create("alphabetical", {
                    x: "test"
                });
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input array", function() {
                var form = spec.create("alphabetical", ["test", "test2"]);
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input undefined", function() {
                var form = spec.create("alphabetical", undefined);
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input null", function() {
                var form = spec.create("alphabetical", null);
                expect(form.isValid()).toBeFalsy();
            });
        });
        
        describe("required", function() {
            it("as valid for any string", function() {
                var form = spec.create("required", "abc!@ASD234(");
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input number", function() {
                var form = spec.create("required", 0);
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input object", function() {
                var form = spec.create("required", {
                    x: "test"
                });
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input array", function() {
                var form = spec.create("required", ["test", "test2"]);
                expect(form.isValid()).toBeTruthy();
            });
            it("as invalid for input undefined", function() {
                var form = spec.create("required", undefined);
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input empty string", function() {
                var form = spec.create("required", "");
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid for input null", function() {
                var form = spec.create("required", null);
                expect(form.isValid()).toBeFalsy();
            });
        });
        
        describe("optional", function() {
            it("as valid for any string", function() {
                var form = spec.create("optional", "abc!@ASD234(");
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input number", function() {
                var form = spec.create("optional", 0);
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input object", function() {
                var form = spec.create("optional", {
                    x: "test"
                });
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input array", function() {
                var form = spec.create("optional", ["test", "test2"]);
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input undefined", function() {
                var form = spec.create("optional", undefined);
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid for input null", function() {
                var form = spec.create("optional", null);
                expect(form.isValid()).toBeTruthy();
            });
            describe("combined with another validation", function() {
                it("should be valid for email validation with correct formatted input value",function(){
                    var form = spec.create("optional email", "mail@me.com");
                    expect(form.isValid()).toBeTruthy();
                });
                it("should be invalid for email validation with wrong formatted input value",function(){
                    var form = spec.create("optional email", "mailme.com");
                    expect(form.isValid()).toBeFalsy();
                });
                it("should be valid for email validation with empty input value",function(){
                    var form = spec.create("optional email", "");
                    expect(form.isValid()).toBeTruthy()
                });
                it("should be valid for email validation with `undefined` input value",function(){
                    var form = spec.create("optional email", undefined);
                    expect(form.isValid()).toBeTruthy();
                });
                it("should be valid for email validation with `null` input value",function(){
                    var form = spec.create("optional email", null);
                    expect(form.isValid()).toBeTruthy();
                });
            });
            describe("combinde with a constrain check", function(){
                it("should be valid for `min` `max` constrains with correct input value",function(){
                    var form = spec.create("optional", "normal");
                    spec.last.min = 4;
                    spec.last.max = 8;
                    expect(form.isValid()).toBeTruthy();
                });
                it("should be valid for `min` `max` constrains but empty input value",function(){
                    var form = spec.create("optional", "");
                    spec.last.min = 4;
                    spec.last.max = 8;
                    expect(form.isValid()).toBeTruthy();
                });
                it("should be invalid for `min` `max` constrains with wrong input value",function(){
                    var form = spec.create("optional", "toolooooong");
                    spec.last.min = 4;
                    spec.last.max = 8;
                    expect(form.isValid()).toBeFalsy();
                });
            });
        });
    });
    
    describe("evaluating the constrain of", function() {

        describe("min against input length", function() {
            it("as valid when a string length(4) is longer than the given value(2)", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.min = 2;
                form.validate();
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid when a string length(4) is longer equal the given value(4)", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.min = 4;
                form.validate();
                expect(form.isValid()).toBeTruthy();
            });
            it("as invalid when a string length(4) is longer less than the given value(5)", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.min = 5;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the given value is undefined", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.min = undefined;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the given value is a string", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.min = "string";
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
        });

        describe("max against input length", function() {
            it("as valid when a string length(4) is less than the constrain value(5)", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.max = 5;
                form.validate();
                expect(form.isValid()).toBeTruthy();
            });
            it("as valid when a string length(4) is equal the constrain value(4)", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.max = 4;
                form.validate();
                expect(form.isValid()).toBeTruthy();
            });
            it("as invalid when a string length(4) is longer than the constrain value(2)", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.max = 2;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain value is undefined", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.max = undefined;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain value is a string", function() {
                var form = spec.create("alphanumeric", "test");
                spec.last.max = "string";
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
        });
        describe("gt against input value", function() {
            it("as valid when an input number(10) is greater than constrain number(1)", function() {
                var form = spec.create("number", 10);
                spec.last.gt = 1;
                form.validate();
                expect(form.isValid()).toBeTruthy();
            });
            it("as invalid when an input number(10) is equal with the constrain number(10)", function() {
                var form = spec.create("number", 10);
                spec.last.gt = 10;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when an input number(10) is less than constrain number(11)", function() {
                var form = spec.create("number", 10);
                spec.last.gt = 11;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is undefined", function() {
                var form = spec.create("number", 10);
                spec.last.gt = undefined;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is a string", function() {
                var form = spec.create("number", 10);
                spec.last.gt = "string";
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
        });
        describe("lt against input value", function() {
            it("as valid when an input number(10) is less than constrain number(11)", function() {
                var form = spec.create("number", 10);
                spec.last.lt = 11;
                form.validate();
                expect(form.isValid()).toBeTruthy();
            });
            it("as invalid when an input number(10) is greater than constrain number(1)", function() {
                var form = spec.create("number", 10);
                spec.last.lt = 1;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when an input number(10) is equal with the constrain number(10)", function() {
                var form = spec.create("number", 10);
                spec.last.lt = 10;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is undefined", function() {
                var form = spec.create("number", 10);
                spec.last.lt = undefined;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is a string", function() {
                var form = spec.create("number", 10);
                spec.last.lt = "string";
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
        });
        describe("eq against input value", function() {
            it("as valid when an input number(10) is equal with the constrain number(10)", function() {
                var form = spec.create("number", 10);
                spec.last.eq = 10;
                form.validate();
                expect(form.isValid()).toBeTruthy();
            });
            it("as invalid when an input number(10) is less than constrain number(11)", function() {
                var form = spec.create("number", 10);
                spec.last.eq = 11;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when an input number(10) is greater than constrain number(1)", function() {
                var form = spec.create("number", 10);
                spec.last.eq = 1;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is undefined", function() {
                var form = spec.create("number", 10);
                spec.last.eq = undefined;
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid when the constrain is a string", function() {
                var form = spec.create("number", 10);
                spec.last.eq = "string";
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
        });
        
        describe("sameas", function() {
            it("as valid while it has the same value with the element it points to by name.", function() {
                var form = spec.create("required", "nickname");
                var $elTarget = spec.last;
                $elTarget.setName("username");
                spec.create("required", "nickname", form);
                spec.last.sameas = "username";
                spec.render();
                form.validate();
                expect(form.isValid()).toBeTruthy();
            });

            it("as invalid while it has  different value than the element it points to by name.", function() {
                var form = spec.create("required", "nickname");
                var $elTarget = spec.last;
                $elTarget.setName("username");
                spec.create("required", "differentname", form);
                spec.last.sameas = "username";
                spec.render();
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid while it has no value set unlike the element it points to by name.", function() {
                var form = spec.create("required", "nickname");
                var $elTarget = spec.last;
                $elTarget.setName("username");
                spec.create("required", undefined, form);
                spec.last.sameas = "username";
                spec.render();
                form.validate();
                expect(form.isValid()).toBeFalsy();
            });
        });
    });
    describe(".addValidation()", function(){
        it("adds a new validation function to `orthos` named `hello` and accepts as input only word `hello`", function(){
            orthos.Validatable.addValidation("hello", function(input){
                return input === "hello";
            }, "should be 'hello'");
            expect(true).toBeTruthy();
        });
        describe("is affecting every instance of orthos.Validatable and `hello` validation validates", function(){
            it("as invalid an `undefined` Input value", function(){
                var form = spec.create("hello", undefined); //creates new instance
                expect(form.isValid()).toBeFalsy();
            });
            it("as invalid any other Input value", function(){
                var form = spec.create("hello", "nothello"); 
                expect(form.isValid()).toBeFalsy();
            });
            it("as valid an Input with value 'hello'", function(){
                var form = spec.create("hello", "hello");
                expect(form.isValid()).toBeTruthy();
            });
        });
    });
});