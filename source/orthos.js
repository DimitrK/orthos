(function (enyo) {
    var validationWord;
    var exceptions, validations, constrains; // Dictionaries
    var runChecker, setElementClasses, shouldValidate, validateForm, findControlByName, validateControl, keyHasError, addEventListener; // Helper functions

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
            error: "should be a number."
        },
        alphanumeric: {
            check: function (input) {
                return (/^\w+$/g).test(input);
            },
            error: "should consist of letters or numbers."
        },
        alphabetical: {
            check: function(input) {
                // Exclude booleas as well
                //return (/(?=^(?!(false|true)).)(?=^[A-Za-z]+$)/g).test(input);
                return (/^[A-Za-z]+$/g).test(input);
            },
            error: "should consist of alphabetical characters only."
        },
        email: {
            check: function (input) {
                return (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i).test(input); //'
            },
            error: "should be a correctly formatted email address."
        },
        required: {
            check: function (input) {
                return ( !! input && input !== 0) || input === 0;
            },
            error: "should not be empty."
        },
        optional: {
            check: function() {
                return true;
            },
            error: ""
        }
    };
    // Constrain check algorithms
    constrains = {
        min: {
            val: undefined,
            check: function (input) {
                this.error = "should be more than " + this.val + " characters long.";
                return input.length >= this.val;
            },
            error: ""
        },
        max: {
            val: undefined,
            check: function (input) {
                this.error = "should be less than " + this.val + " characters long.";
                return input.length <= this.val;
            },
            error: ""
        },
        gt: {
            val: undefined,
            check: function (input) {
                this.error = "should be greater than " + this.val + ".";
                return input > this.val;
            },
            error: ""
        },
        lt: {
            val: undefined,
            check: function (input) {
                this.error = "should be less than " + this.val + ".";
                return input < this.val;
            },
            error: ""
        },
        eq: {
            val: undefined,
            check: function (input) {
                this.error = "should be equal to " + this.val + ".";
                return input === this.val;
            },
            error: ""
        },
        sameas: {
            val: undefined,
            scope: {},
            check: function (input, inputEl) {
                this.error = "should be same as " + this.val + ".";
                var control = findControlByName.call(this.scope, this.val);
                addEventListener(control, "change", this.scope.validate.bind(this.scope, inputEl));
                return input === control.getValue();
            }
        }
    };
    
    getValidationsArray = function(control) {
        // Change any capital case to lower, remove any spaces at start or end of string and then split it when spaces detected.
        var validationsString, validationsArray;
        validationsString  = control[validationWord].toLowerCase().replace(/(^\s+|\s+$)/g,"");
        if ( validationsString === "" ) {
            return [];
        } else {
            validationsArray = validationsString.split(/\s+/g);
            return validationsArray;
        }
    };

    // For some fucked up reason enyo.dispatcher wont work.
    addEventListener = function(inControl, inEventType, inHandler) {
        var node = inControl.node;
        var destroy = inControl.destroy;
        if (node.addEventListener) {
            node.addEventListener(inEventType, inHandler, false);
            inControl.destroy = function() {
                node.removeEventListener(inEventType, inHandler);
                destroy.apply(inControl, arguments);
            };
        }
        else if (inNode.attachEvent) {
            node.attachEvent('on' + inEventType, inHandler);
            inControl.destroy = function() {
                node.detachEvent('on' + inEventType, inHandler);
                destroy.apply(inControl, arguments);
            };
        } else {
            node["on" + inEventType] = inHandler;
            inControl.destroy = function() {
                node["on" + inEventType] = undefined;
                destroy.apply(inControl, arguments);
            };
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

        // If it is in a decorator or input decorator (enyo or any class containing string `input-decorator`),
        // the parent class should get the styles.
        if (parent && (parent.hasClass("enyo-tool-decorator") || ~parent.getClassAttribute().indexOf("input-decorator"))) {
            inputEl = parent;
        }
        inputEl.addRemoveClass(this.getErrorClass(),  errorExists);
        inputEl.addRemoveClass(this.getSuccessClass(), !errorExists);
    };

    shouldValidate = function(control) {
        return control.hasOwnProperty(validationWord);
    };

    validateControl = function(control) {
        var prefferedValidations, selectedConstrain;
        prefferedValidations = getValidationsArray(control);
        if ( !~prefferedValidations.indexOf("optional") && !~prefferedValidations.indexOf("required") ) {
            prefferedValidations.push("required"); // Make by default required if none is passed
        }
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

        if (this.getWithClasses() === true) {
            setElementClasses.call(this, control);
        }
    };

    validateForm = function (form) {
        // Recursive check in children controls
        enyo.forEach(form.getControls(), function (control) {
            if (!shouldValidate(control)) {
                validateForm.call(this, control);
            } else {
                validateControl.call(this, control);
            }
        }, this);
        form._validated = true;
    };

    return enyo.kind({
        name: "orthos.Validatable",
        kind: enyo.Control,
        published: {
            errorClass: "orthos-validation-error",
            successClass: "orthos-validation-success",
            withClasses: true,
            live: true
        },
        events: {
            onLiveError: "",
            onLiveSuccess: ""
        },
        handlers: {
            onchange: "_handleChange",
            onkeypress: "_handleKeyPress"
        },
        components: [],
        errors: {},
        _validated: false,
        create: function() {
            this.inherited(arguments);
            this._validated = false;
        },
        statics: {
            /**
             * Adds a custom validation method.
             * @param {String} alias      The alias of the specific validation. e.g. `is:"<alias>"`.
             * @param {(Function|String)} validation The validation function or regexp which will be used to validate the input.
             * @param {String} errorMsg   The error message which  will appear in case of invalid input to the user.
             * @param {Boolean} override  Override existing validation with the same alias.
             */
            addValidation: function(alias, validation, errorMsg, override) {
                var validateFn;
                if (validation instanceof RegExp) {
                    validateFn = function(input) {
                        return validation.test(input);
                    };
                } else if( validation instanceof Function) {
                    validateFn = validation;
                } else {
                    validateFn = function() {
                        return true;
                    };
                    enyo.warn("No validation Function or RegExp passed.");
                }
                if (validations && alias && (!validations[alias] || override) ) {
                    alias = enyo.toLowerCase(alias);
                    validations[alias] = {
                        check: validateFn,
                        error: errorMsg
                    };
                } else {
                    enyo.log("Validation alias already exists.Change alias or set override to true.");
                }
            }
        },
        /**
         * Checks if a control is valid by looking up in the errors object. If none 
         * provided checks for the whole form. If form was never validated before it
         * will try to validate it before checking
         * for its validity
         * @param  {enyo.Instance}  control The control which will be checked
         * @return {Boolean}         False if is invalid, True if valid
         */
        isValid: function (control) {
            control = control || this;
            var errorKey;
            var controlName;
            if ( control === this ) {
                !this._validated && this.validate(control);
                // Checks if there are any errors in the errors object. If there are, can not be valid.
                for (errorKey in this.errors) {
                    if (keyHasError.call(this, errorKey)) {
                        return false;
                    }
                }
                return true;
            } else {
                // Checks for any error in the errors object based on the control's name as a key.
                // If the specific key has no error then the control is valid.
                return !keyHasError.call(this, control.name);
            }
        },
        /**
         * Returns an array containing all the errors located in the `errors` object.
         * @return {Array} The array with the error objects
         */
        getErrorsArray: function () {
            var errorKey, errorsArray, combinedError;
            errorsArray = [];
            for (errorKey in this.errors) {
                if (keyHasError.call(this,errorKey)) {
                    combinedError = errorKey + " " + this.errors[errorKey][0];
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
         * @return {String}
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
         * Changes validation methods as stated in `is` property of the control
         * @param  {enyo.Instance} control   An enyo input control
         * @param  {String} inValidation  The new validation
         * @param  {String} outValidation The validation that shall get replaced, if none provided then the new validation will get appended.
         */
        changeContorlValidation: function(control, inValidation, outValidation) {
            var controlValidations = getValidationsArray(control),
                outIndexInValidations = controlValidations.indexOf(outValidation),
                inIndexInValidations = controlValidations.indexOf(inValidation);
            if (enyo.isObject(control) && !!validations[inValidation] && !~inIndexInValidations) {
                if (~outIndexInValidations) {
                    controlValidations[outIndexInValidations] = inValidation;
                } else {
                    controlValidations.push(inValidation);
                }
                control[validationWord] = controlValidations.join(" ");
                this._validated = false;
            }
        },
        /**
         * Validates a specific control if proviced. Otherwise all the input controls in the form.
         * @param  {enyo.Instance} control [description]
         */
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
        },
        //* Private methods
        _handleChange: function(inSender, inEvent) {
            var control = inEvent.originator;
            var needsValidation = shouldValidate(control);
            enyo.job.stop("keyPressed"); // In case there is any running keypress timeouts.
            // If form is validated and the control needs validation then mark `this._validated` as `false`
            this._validated = this._validated && !needsValidation;
            if( this.getLive() && needsValidation ){
                this.validate(control);
                if( keyHasError.call(this,control.name) ){
                    this.doLiveError(control);
                } else {
                    this.doLiveSuccess(control);
                }
            }
        },
        _handleKeyPress: function(inSender, inEvent) {
            var args = arguments;
            enyo.job("keyPressed", enyo.bind(this, function(){
                this._handleChange.apply(this, args);
            }), 1200);
        }
    });
})(enyo);
