----
## Orthos for EnyoJS 
A input validation JavaScript library for [Enyo](https://github.com/enyojs/enyo) JS ***[(Sample)](http://jsfiddle.net/dimitrk/Zz9MN/4/)***

***

### **Description**

Orthos is a JavaScript library that provides validations of input fields and is meant to be used with Enyo; a JavaScript framework focused mostly on development of mobile and tablet applications. It came to life out of my need to use validation of input fields across different modules in a clean and easy to understand way.

The functionalities provided in this library are :

* **Validates for formats:**
    * Number
    * Alphanumeric
    * E-mail
    * Required field
* **Checks for constrains:**
    * Minimum
    * Maximum
    * Less than
    * Greater than
    * Equals ( direct value comparisson)
    * Same as ( value comparisson based on another's field value)
* **Presents validation errors as:**
    * Object
    * Array
    * Raw HTML List
    * Onyx Popup



### **Integrating the library**

If you are using [Enyo Bootplate](https://github.com/enyojs/enyo/wiki/Bootplate), as with any usual Enyo library just copy the `orthos` folder to the project's `lib` directory and update the `package.js` file to point to the `orthos` folder as well.
In case you based your project in a different directory structure, include it wherever you see appropriate and make sure to update the nearest `package.js` file with the relative location of `orthos` folder.


```javascript
    // Adding the new dependency
    enyo.depends(
        "$lib/layout",
        .
        .
        "$lib/orthos"
    );

```


### **Using Orthos**
Orthos intoduces a new kind to Enyo named `orthos.Validatable`. By including an `Input` kind inside its components, this input will automatically get enhanced with all the validation and constrain notation as published properties on it.

**These properties are:**

* **is** - Used for the basic validation. Gets a string containing one or more comma separated values between `"required", "alphanumeric", "email", "number"`.
* **gt** - Used for constrain check. Gets a number. Compares if the current input value is greater than the given number.
* **lt** - Used for constrain check. Gets a number. Compares if the current input value is less than the given number.
* **eq** - Used for constrain check. Gets a number. Compares if the current input value is equals with the given number.
* **min** - Used for constrain check. Gets a number. Compares if the current ***input length*** is greater or equal than the given number.
* **max** - Used for constrain check. Gets a number. Compares if the current ***input length*** is less or equal than the given number.
* **sameas** - Used for constrain check. Gets a string indicating the component's name of another input field. Compares if the current input value is the same as the input value of the field with the given name

**Published properties:**

* **withClasses** - *(default: true)* Add classes to inputs or their decorators if any, after validation.
* **errorClass** - *(default: "validation-error")* The name of the class in case of a failed validation and `withClasses` is set to `true`.
* **successClass** - *(default: "validation-success")* The name of the class in case of a successful validation and `withClasses` is set to `true`.
* **live** - *(default: true)* Validates each input when its value changes or an `onchange` event is fired.

**Events:**

* **onLiveError** - Event that fires when `live` is set to true and validation fails. Returns the form and the input control that has been validated.
* **onLiveSuccess** - Event that fires when `live` is set to true and validation succeeds. Returns the form and the input control that has been validated.

**Simple Example:**
```javascript
enyo.kind({
    name: "Register",
    kind: orthos.Validatable,
    components: [
        {kind: onyx.Input, name: "username", is: "required alphanumeric", min: 6, max: 15},
        {kind: onyx.Input, name: "password", type:"password", is: "required", min: 6},
        {kind: onyx.Input, name: "passwordVerify", type:"password", is: "required", sameas: "password"},
        {kind: onyx.Input, name: "email", is: "required email"},
        {kind: onyx.Button, content: "Register", ontap: "register"}
    ],
    .
    .
    register: function(){...} // will be filled later on

});
```

In the above example, the components inside `orthos.Validatable` control named `Register` can be validated by calling `Register`'s `validate()` method. To see wether the validation failed or not, the **`isValid()`** method can be called which will return a boolean value.

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
* **Onyx PopUp** - By calling the `showErrorsPopup()` method.

**Example** *(continue from above example)* **:**
```javascript
enyo.kind({
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
    }
});
```
***

### ***Yet to do:***
* Add tests

***
If there are any requests, bugs, ideas create an issue or even better a pull request :)


Author: [DimitrK](http://dimitrisk.info)


License: [BSD License](https://github.com/DimitrK/orthos/blob/master/license.txt)
