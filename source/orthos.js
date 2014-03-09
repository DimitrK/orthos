(function (enyo) {
    var validationWord, formValidated;
    var exceptions, validations, constrains; // Dictionaries
    var runChecker, setElementClasses, validateForm, findControlByName, validateControl, keyHasError, addEventListener; // Helper functions

    formValidated = false;
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
        },
        events: {
            name: "EventsNotSupported",
            message: "The environment is not supporting known event listening API."
        }
    };
    // Validation algorithms
    validations = {
        number: {
            check: function (input) {
                return input === +input;
            },
            error: " should be a number."
        },
        alphanumeric: {
            check: function (input) {
                return (/^\w+$/g).test(input);
            },
            error: " should consist of letters or numbers."
        },
        email: {
            check: function (input) {
                return (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i).test(input); //'
            },
            error: " should be a correctly formatted email address."
        },
        required: {
            check: function (input) {
                return ( !! input && input !== 0) || input === 0;
            },
            error: " should not be empty."
        }
    };
    // Constrain check algorithms
    constrains = {
        min: {
            val: undefined,
            check: function (input) {
                this.error = " should be more than " + this.val + " characters long.";
                return input.length >= this.val;
            },
            error: ""
        },
        max: {
            val: undefined,
            check: function (input) {
                this.error = " should be less than " + this.val + " characters long.";
                return input.length <= this.val;
            },
            error: ""
        },
        gt: {
            val: undefined,
            check: function (input) {
                this.error = "  should be greater than " + this.val + ".";
                return input > this.val;
            },
            error: ""
        },
        lt: {
            val: undefined,
            check: function (input) {
                this.error = " should be less than " + this.val + ".";
                return input < this.val;
            },
            error: ""
        },
        eq: {
            val: undefined,
            check: function (input) {
                this.error = " should be equal to " + this.val + ".";
                return input === this.val;
            },
            error: ""
        },
        sameas: {
            val: undefined,
            scope: {},
            check: function (input, inputEl) {
                this.error = " should be same as " + this.val + ".";
                var control = findControlByName.call(this.scope, this.val);
                addEventListener(control.node, "change", this.scope.validate.bind(this.scope, inputEl));
                return input === control.value;
            }
        }
    };

    // For some fucked up reason anyo.dispatcher wont work.
    addEventListener = function(inNode, inEventType, inHandler) {
        if (inNode.addEventListener) {
            inNode.addEventListener(inEventType, inHandler, false);
        } 
        else if (inNode.attachEvent) {
            inNode.attachEvent('on'+inEventType, inHandler);
        } else {
            throw exceptions.events;
        }
    };

    runChecker = function (checkFn, inputControl) {
        var key = inputControl.getName();
        // Call the `check` function of the validator and the constrains.
        // Put any possible errors in case validation fails.
        if (!checkFn.check(inputControl.getValue(), inputControl)) {
            this.errors[key] = this.errors[key] || [];
            this.errors[key].push(checkFn.error);
        }
    };

    findControlByName = function(name) {
        var foundControl;
        var controls, control, counter;
        controls = this.getControls();
        for(counter = 0; counter<controls.length; counter++ ) {
            if (foundControl) {
                return foundControl;
            }
            control = controls[counter];
            if ( control.name === name ) {
                foundControl = control;
                return foundControl;
            } else {
                foundControl = findControlByName.call(control, name);
            }
        }
        return foundControl;
    };
    
    keyHasError = function(key) {
        return this.errors.hasOwnProperty(key) && this.errors[key].length > 0;
    };

    setElementClasses = function (inputEl) {
        var inputName = inputEl.getName(), 
        errorExists = keyHasError.call(this,inputName), 
        parent = inputEl.parent;

        // If it is in a decorator, the parent class should get the styles.
        if (parent && (parent.hasClass("enyo-tool-decorator") || parent.hasClass("onyx-input-decorator"))) {
            inputEl = parent;
        }
        inputEl.addRemoveClass(this.getErrorClass(),  errorExists);
        inputEl.addRemoveClass(this.getSuccessClass(), !errorExists);
    };


    validateControl = function(control) {
        var prefferedValidations, selectedConstrain;
        prefferedValidations = control[validationWord].toLowerCase().split(" ");
        enyo.forEach(prefferedValidations, function (validationName) {
            if (validations.hasOwnProperty(validationName)) {
                runChecker.apply(this, [validations[validationName], control]);
            } else {
                throw exceptions.validation;
            }
        }, this);

        for (var constrain in constrains) {
            if (control.hasOwnProperty(constrain)) {
                selectedConstrain = constrains[constrain];
                selectedConstrain.val = control[constrain];
                selectedConstrain.scope ? selectedConstrain.scope = this : undefined;
                runChecker.apply(this, [selectedConstrain, control]);
            }
        }
    };

    validateForm = function (form) {
        // Recursive check in children controls
        enyo.forEach(form.getControls(), function (control) {
            if (!control.hasOwnProperty(validationWord)) {
                return validateForm.call(this, control);
            } else {
                return validateControl.call(this, control);
            }
        }, this);
        formValidated = true;
    };

    return enyo.kind({
        name: "orthos.Validatable",
        kind: enyo.Control,
        published: {
            errorClass: "validation-error",
            successClass: "validation-success",
            interactiveClasses: true,
            live: true
        },
        events: {
            onValidationError: "",
            onValidationSuccess: ""
        },
        handlers: {
            onchange: "_handleChange"
        },
        components: [],
        errors: {},
        /**
         * Checks if the validation is passed by looking if there are any errors in the `errors` object
         * @return bool
         */
        create: function () {
            this.inherited(arguments);
        },
        rendered: function () {
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
        isValid: function () {
            var errorKey;
            if (!formValidated) {
                throw new Error("Form not validated");
            }
            // Checks if there are any errors in the errors object. If there are, can not be valid.
            for (errorKey in this.errors) {
                if (keyHasError.call(this,errorKey)) {
                    return false;
                }
            }
            return true;
        },
        /**
         * Returns an array containing all the errors located in the `errors` object.
         * @return array The array with the error objects
         */
        getErrorsArray: function () {
            var errorKey, errorsArray, combinedError;
            errorsArray = [];
            for (errorKey in this.errors) {
                if (keyHasError.call(this,errorKey)) {
                    combinedError = errorKey + this.errors[errorKey][0];
                    if (this.errors[errorKey].length > 1) {
                        for (var i = 1; i < this.errors[errorKey].length; i++) {
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
        getErrorsHtml: function () {
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
        showErrorsPopup: function () {
            if (!this.isValid()) {
                this.$.errorsPopup.setContent(this.getErrorsHtml());
                this.$.errorsPopup.show();
            }
        },
        validate: function (control) {
            control = control || this;
            if ( control === this ) {
                // this reffers to the present control which is the container of all inputs - form
                this.errors = {};
                validateForm.call(this, this);
            } else {
                // when specific control is given as an argument
                this.errors = this.errors || {};
                this.errors[control.name] = [];
                validateControl.call(this, control);
            }

            if (this.getInteractiveClasses()) {
                setElementClasses.call(this, control);
            }
        },
        _handleChange: function(inSender, inEvent) {
            if( this.getLive() ){
                var control = inEvent.originator;
                this.validate(control);
                if( keyHasError.call(this,control.name) ){
                    this.doValidationError(control);
                } else {
                    this.doValidationSuccess(control);
                }
            }
        }
    });
})(enyo);
