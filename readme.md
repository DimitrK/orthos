----
## Orthos for EnyoJS

[![Join the chat at https://gitter.im/DimitrK/orthos](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/DimitrK/orthos?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
A input validation JavaScript library for [Enyo](https://github.com/enyojs/enyo) JS ***[(Sample)](http://jsfiddle.net/dimitrk/a5h6P/)*** ***[(Source Coverage/Analysis)](http://dimitrk.github.io/enyo/orthos/index.html)***

[![Build Status](https://travis-ci.org/DimitrK/orthos.svg?branch=master)](https://travis-ci.org/DimitrK/orthos)
***

### **Description**

Orthos is a JavaScript library that provides validations of input fields and is meant to be used with Enyo; a JavaScript framework focused mostly on development of mobile and tablet applications. It came to life out of my need to use validation of input fields across different modules in a clean and easy to understand way.

The functionalities provided in this library are :

* **Validation formats:**
    * Number
    * Alphanumeric
    * Alphabetical (letters only a-zA-Z)
    * E-mail
    * Required field
    * Optional field
    * *Possibility to add custom validations*
* **Checks for constrains**
    * Minimum
    * Maximum
    * Less than
    * Greater than
    * Equals ( direct value comparisson)
    * Same as ( value comparisson based on another's field value.)
* **Presents validation errors as:**
    * Object
    * Array
    * Raw HTML List

### **Enyo Veersion Compatibility**

Orthos has been tested with EnyoJS v2.2 - v2.4 and seemed to work properly.

### **Integrating the library**

If you are using [Enyo Bootplate](https://github.com/enyojs/enyo/wiki/Bootplate), as with any usual Enyo library just download & copy, clone or add as submodule the `orthos` library to the project's `lib` directory and update the `package.js` file to point to the `orthos` folder as well.
In case you based your project in a different directory structure, include it wherever you see appropriate and make sure to update your `package.js` file with the relative location of `orthos` folder from it.


```javascript
    // Adding the new dependency
    enyo.depends(kr
        "$lib/layout",
        .
        .
        "$lib/orthos"
    );

```


### **Using Orthos**
Orthos intoduces a new kind to Enyo named `orthos.Validatable`. By including an `Input` kind inside its components, this input will automatically get enhanced with all the validation and constrain notation as published properties on it.

**These properties are:**

* **is** - Used for the basic validation. Gets a string containing one or more space separated values among `"required", "optional", "alphanumeric", "alphabetical", "email", "number"`. *Note: An input which among other validations contains  as well `optional` will get validated only in case its value is other than empty.*
* **gt** - Used for constrain check. Gets a number. Compares if the current input value is greater than the given number.
* **lt** - Used for constrain check. Gets a number. Compares if the current input value is less than the given number.
* **eq** - Used for constrain check. Gets a number. Compares if the current input value is equals with the given number.
* **min** - Used for constrain check. Gets a number. Compares if the current ***input length*** is greater or equal than the given number.
* **max** - Used for constrain check. Gets a number. Compares if the current ***input length*** is less or equal than the given number.
* **sameas** - Used for constrain check. Gets a string indicating the component's name of another input field. Compares if the current input value is the same as the input value of the field with the given Control's name. If a change will occur to the Control which passed as reference, then the present input will be revalidated.

**Published properties:**

* **withClasses** - *(default: true)* Add classes to inputs or their decorators if any, after validation.
* **errorClass** - *(default: "validation-error")* The name of the class in case of a failed validation and `withClasses` is set to `true`.
* **successClass** - *(default: "validation-success")* The name of the class in case of a successful validation and `withClasses` is set to `true`.
* **live** - *(default: true)* Validates each input when an `onchange` or a `keypress` event is fired.

**Events:**

* **onLiveError** - Event that fires when `live` is set to true and validation fails. Returns the form and the event of the input which it came from.
* **onLiveSuccess** - Event that fires when `live` is set to true and validation succeeds. Returns the form and the event of the input which it came from.

**Switching validations**
You are able to switch the validations of an Input element of the form, or to add new ones by using the method `changeContorlValidation`. This method takes as first argument the control on which one of it validations will get replaced (if there are more than one), second argument the name of the new validation and third argument the name of the validation which is about to get replaced.
If the third argument is not set, or non existing validation, the new validation will get appended to the existing ones.

**Switching validations Exanoke:**
```javascript
/** Example Use Case
*  A scenario where user is asked for email address in some form filling process.
* In case there is no email address, then a physical post address should be provided
* instead. Post mail is the only way to reach that user now, therefor it should be
* required while email should be optional since there is none to be provided and the whole
* form validation will fail if left as required. In the mean time every optional input
* is hided for cleaner user interface.
**/
enyo.kind({
    name: "Register",
    kind: orthos.Validatable,
    components: [
        .
        .
        .
        { components: [
            { kind: onyx.Checkbox, classes: "enyo-inline", onchange:"togglePostMailMode"},
            { classes: "enyo-inline", content: "I don't have e-mail address."},
        ]},
        {kind: onyx.Input, name: "email", is: "required email", min: 6, placeholder: "E-mail"},
        {kind: onyx.Input, name: "post", is: "optional alphanumeric", min: 6, placeholder: "Post mail address", showing: false},
        .
        .
        ],
        .
        .
        togglePostMailMode: function(inSender, inEvent) {
            var postMailActive = inSender.getChecked();
            var emailValidation = postMailActive ? "optional" : "required";
            var postValidation = !postMailActive ? "optional" : "required";

            this.$.email.parent.setShowing(!postMailActive);
            this.$.form.changeContorlValidation(this.$.email, emailValidation, postValidation);
            this.$.post.parent.setShowing(postMailActive);
            this.$.form.changeContorlValidation(this.$.post, postValidation, emailValidation);
        }
    ],
    .
    .

});
```


**Custom Validations:**
You can add your own custom validations before or during the use of Orthos lib. It is done through a static method named `addValidation`. The required arguments are :
* **`alias`**  The name of the validation.
* **`validation`**  The validation function or regexp which will be used to validate the input.
* **`errorMsg`**  The error message which  will appear in case of invalid input to the user.
* **`override`**  Override existing validation with the same alias.

**Custom Validation Example:**
```javascript
// Function as validation argument
orthos.Validatable.addValidation("gender", function(input){ return input === "male" || input === "female"; }, "should be male or female", false );
// RegExp as validation argument
orthos.Validatable.addValidation("locase", /^[a-z]+$/g, "should be lower case letters", false);
```

**Simple Example:**
*(With use of custom validations from above)*
```javascript
enyo.kind({
    name: "Register",
    kind: orthos.Validatable,
    components: [
        {kind: onyx.Input, name: "username", is: "required alphanumeric", min: 6, max: 15},
        {kind: onyx.Input, name: "password", type:"password", is: "required", min: 6},
        {kind: onyx.Input, name: "passwordVerify", type:"password", is: "required", sameas: "password"},
        {kind: onyx.Input, name: "email", is: "required email"},
        {kind: onyx.Input, name: "gender", is: "required gender"}, //Custom
        {kind: onyx.Input, name: "words", is: "optional locase"} //Custom
        {kind: onyx.Button, content: "Register", ontap: "register"}
    ],
    .
    .
    register: function(){...} // will be filled later on

});
```

In the above example, the components inside `orthos.Validatable` control named `Register` can be validated by calling `Register`'s `isValid()` method. To see wether the validation failed or not, the **`isValid()`** method will return a boolean value. *Note: Wheneve an Input value changes programmaticaly, method `.validate()` should be called for the valiadtion and later `isValid()` will simply return the result.*

In case of validation failure the errors of the `orthos.validatable` can be retrieved in different formats such as:

* **Object** - By accessing the `errors` property.

```
{
    username: [" should be more than 6 characters long."],
    password: [" should be more than 6 characters long."],
    passwordVerify: [" should be same as password."],
    email: [" should be a correctly formatted email address."]
}
```

* **Array** - By calling the `getErrorsArray()` method.

```
[
"Username should be more than 6 characters long.",
"Password should be more than 6 characters long.",
"PasswordVerify should be same as password.",
"Email should be a correctly formatted email address."
]
```
* **HTML List** - By calling the `getErrorsHtml()` method`.
```
"<ul>
    <li>Username should be more than 6 characters long.</li>
    <li>Password should be more than 6 characters long.</li>
    <li>PasswordVerify should be same as password.</li>
    <li>Email should be a correctly formatted email address.</li>
</ul>"
```

**Example** *(continue from above example)* **:**
```javascript
enyo.kind({
    name: ....,
    kind: ....,
    onLiveSuccess: "doLiveSuccess",
    onLiveError: "doLiveError",
    .
    .
    register: function() {
        var errorsObject, errorsArray, errorsHtml;
        this.validate(); // "this" reffers to our main module kind that inherits from orthos.Validatable
        if (this.isValid()) {
            // Continue to registration
        } else {
            errorsObject = this.errors; // Returns an object of errors
            errorsArray = this.getErrorsArray(); // Returns an array of errors
            errorsHtml = this.getErrorsHtml(); // Returns errors in Html format
            this.showErrorsPopup(); // Show Html formatted onyx popup
        }
    },
    doLiveSuccess: function(form, inEvent) {
        var controlSucceed = inEvent.originator;
        var controlDomNode = inEvent.srcElement;
        // do what you want on success..
        console.log(controlSucceed.name + " passed validation ");
    }
    doLiveError: function(form, inEvent) {
        // Same applies here
    }
});

```
***

### ***Yet to do:***
* Add more tests
* Add localization (error messages)
* Get camelcased or minus/underscore separated control names and break it into more user friendly text for displaying with errors.

*** If there are any requests, bugs, ideas create an issue or even better a pull request :)


Author: [DimitrK](http://dimitrisk.info)


License: [BSD License](https://github.com/DimitrK/orthos/blob/master/license.txt)
