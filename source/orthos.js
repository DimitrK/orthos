var enyo = enyo;
enyo.kind({
    name: "orthos.Validatable",
    kind: enyo.Control,
    published: {
        errorClass: "validation-error",
        successClass: "validation-success",
        interactiveErrors: true
    },
    components: [],
    errors: undefined,
    /**
     * Checks if the validation is passed by looking if there are any errors in the `errors` object
     * @return bool
     */
    rendered: function(){
        this.createComponent({
            name: "errorsPopup",
            kind: "onyx.Popup",
            floating: true,
            centered: true,
            style: "padding: 10px",
            allowHtml: true
        });
        this.inherited(arguments);
    },
    isValid: function() {
        if (this.errors === undefined) {
            throw new Error("validate not called");
        }
        // Checks if there are any errors in the errors object. If there are, can not be valid.
        var error;
        for (error in this.errors) {
            if (this.errors.hasOwnProperty(error)) {
                return false;
            }
        }
        return true;
    },
    /**
     * Returns an array containing all the errors located in the `errors` object.
     * @return array The array with the error objects
     */
    getErrorsArray: function() {
        var errorKey, errorsArray, combinedError;
        errorsArray = [];
        for (errorKey in this.errors) {
            if (this.errors.hasOwnProperty(errorKey)) {
                combinedError = errorKey + this.errors[errorKey][0];
                if(this.errors[errorKey].length>1) {
                    for (var i=1; i < this.errors[errorKey].length; i++) {
                        combinedError = combinedError.substring(0, combinedError.length - 1).replace(" and", ",");
                        combinedError += " and " + this.errors[errorKey][i];
                    }
                }

                errorsArray.push(enyo.cap(combinedError));
            }
        }
        return errorsArray;
    },
    /**
     * Returns a formated HTML list of the errors that the `errors` object contains.
     * @return string
     */
    getErrorsHtml: function() {
        var errorsArray, errorsHtml;
        errorsHtml = "";
        errorsArray = this.getErrorsArray();
        if (errorsArray.length !== 0) {
            errorsHtml = "<ul><li>";
            errorsHtml += errorsArray.join("</li><li>");
            errorsHtml += "</li></ul>";
        }
        return errorsHtml;
    },
    /**
     * Shows a pop up formatted with HTML with all the errors of the `errors` object in it
     * @return void
     */
    showErrorsPopup: function() {
        if (!this.isValid()) {
            this.$.errorsPopup.setContent(this.getErrorsHtml());
            this.$.errorsPopup.show();
        }
    },
    validate: function() {
        this.errors = {};
        var validationResult, validationWord;
        var exceptions, reservedWords, validations, constrains; // Dictionaries
        var runChecker, setElementClasses, validateFn; // Helper functions

        validationWord = "is";

        // Prepublished exceptions
        exceptions = {
            validation: {
                name: "InvalidValidationOperation",
                message: "The validation operation could not be found."
            },
            constrain: {
                name: "InvalidConstrainCheck",
                message: "The constrain check could not be done."
            }
        };

        // Validation algorithms
        validations = {
            number: {
                check: function(input) {
                    return input === +input;
                },
                error: " should be a number."
            },
            alphanumeric: {
                check: function(input) {
                    return (/^\w+$/g).test(input);
                },
                error: " should consist of letters or numbers."
            },
            email: {
                check: function(input) {
                    return (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i).test(input); //'
                },
                error: " should be a correctly formatted email address."
            },
            required: {
                check: function(input) {
                    return (!!input && input !== 0) || input === 0;
                },
                error: " should not be empty."
            }
        };
        // Constrain check algorithms
        constrains = {
            min: {
                val: undefined,
                check: function(input) {
                    this.error = " should be more than " + this.val + " characters long.";
                    return input.length >= this.val;
                },
                error: ""
            },
            max: {
                val: undefined,
                check: function(input) {
                    this.error = " should be less than " + this.val + " characters long.";
                    return input.length <= this.val;
                },
                error: ""
            },
            gt: {
                val: undefined,
                check: function(input) {
                    this.error = "  should be greater than " + this.val + ".";
                    return input > this.val;
                },
                error: ""
            },
            lt: {
                val: undefined,
                check: function(input) {
                    this.error = " should be less than " + this.val + ".";
                    return input < this.val;
                },
                error: ""
            },
            eq: {
                val: undefined,
                check: function(input) {
                    this.error = " should be equal to " + this.val + ".";
                    return input === this.val;
                },
                error: ""
            },
            sameas: {
                val: undefined,
                scope: {},
                check: function(input) {
                    this.error = " should be same as " + this.val + ".";
                    return input === this.scope.$[this.val].value;
                }
            }
        };

        runChecker = function(checkFn, inputControl) {
            var key = inputControl.getName();
            // Call the `check` function of the validator and the constrains.
            // Put any possible errors in case validation fails.
            if (!checkFn.check(inputControl.getValue())) {
                this.errors[key] = this.errors[key] || [];
                this.errors[key].push(checkFn.error);
            }
        };


        setElementClasses = function(inputEl) {
            var inputName = inputEl.getName();
            // If it is in a decorator, the parent class should get the styles.
            if (inputEl.parent && (inputEl.parent.hasClass("enyo-tool-decorator") || inputEl.parent.hasClass("onyx-input-decorator"))) {
                inputEl = inputEl.parent;
            }
            inputEl.addRemoveClass(this.getErrorClass(), this.errors.hasOwnProperty(inputName));
            inputEl.addRemoveClass(this.getSuccessClass(), !this.errors.hasOwnProperty(inputName));
        };

        validateFn = function(control) {
            control = control || this;
            enyo.forEach(control.getControls(), function(control, index){
                if ( !(validationWord in control) ) {
                    return validateFn.call(this, control);
                }
                var prefferedValidations = control[validationWord].toLowerCase();
                prefferedValidations = prefferedValidations.split(" ");
                enyo.forEach(prefferedValidations, function(validationName) {
                    if ( validationName in validations) {
                        runChecker.apply(this, [validations[validationName], control]);
                    } else {
                        throw exceptions.validation;
                    }
                }, this);

                for ( var constrain in constrains ) {
                    if ( constrain in control ) {
                        if (control.hasOwnProperty(constrain)) {
                            constrains[constrain].val = control[constrain];
                            constrains[constrain].scope ? constrains[constrain].scope = this : undefined;
                            runChecker.apply(this, [constrains[constrain], control]);
                        }
                    }
                }

                if (this.getInteractiveErrors()) {
                    setElementClasses.apply(this, [control]);
                }
            },this);
        };
        return validateFn.call(this);
    }
});
