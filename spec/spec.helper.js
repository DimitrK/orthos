/*enyo.kind({
    name: "spec.form",
    kind: "orthos.Validatable",
    components: [
        { kind: mochi.InputDecorator, classes: "input-vertical", components: [
            {kind: mochi.Input, name: "username", placeholder: "Enter your username", is: "required", min: "4"}
        ]},
        { kind: mochi.InputDecorator, classes: "input-vertical", components: [
            {kind: mochi.Input, name: "password", type:"password", is: "required alphanumeric", min: '6', placeholder: "Enter your password"}
        ]},
        { kind: mochi.InputDecorator, classes: "input-vertical", components: [
            {kind: mochi.Input, name: "passwordVerify", type:"password", is: "required", sameas: "password", placeholder: "Re enter your password"}
        ]}
    ]
});
*/

spec = {
    els: [], //All contained in this form
    last: {}, //Last Input element added
};
spec.init = function(form) {
    this.form = form || new orthos.Validatable();
    this.els = [];
    return this.form;
};
spec.create = function(type, value, form) {
    (!form && this.init()) || (form !== this.form && this.init(form));
    var el = {
        kind: enyo.Input,
        name: type + "El" + (Math.floor(Math.random() * ((new Date()).getTime())))
    };
    value !== undefined && (el.value = value);
    !!type && (el.is = type);
    this.last = this.form.createComponent(el, {
        owner: this.form
    });
    this.els.push(this.last);

    return this.form;
};
spec.render = function() {
    this.form.renderInto(document.getElementsByClassName("orthos-spec")[0]);
};

spec.fireEvent = function(sourceEl, event) {
    var isString = function(it) {
        return typeof it == "string" || it instanceof String;
    };
    sourceEl = (isString(sourceEl)) ? document.getElementById(sourceEl) : sourceEl;
    if (document.fireEvent) {
        // dispatch for IE
        return sourceEl.fireEvent('on' + event.type);
    } else {
        return !sourceEl.dispatchEvent(evt);
    }
};
spec.createEvent = function(eventType, eventCtor) {
    eventCtor = eventCtor || "Event";
    if (document.createEventObject) {
        // dispatch for IE
        evt = document.createEventObject();
        evt.type = eventType;
    } else {
        // dispatch for firefox + others
        evt = document.createEvent(eventCtor);
        evt.initEvent(eventType, true, true); // event type,bubbling,cancelable
    }
    return evt;
};
// Specific Event methods. 
(function(spec){
    //Helper
    var getElNode = function(sourceEl){
        sourceEl = sourceEl || {}; // To no throw on .node lookup if is undefined
        !sourceEl.generated && !!spec.render && spec.render();
        return sourceEl.node || (!!sourceEl.nodeName && sourceEl) || spec.last.node || document;
    };


    spec.keyPress = function(input, sourceEl) {
        var currentCharIndex, evt, fireChar;
        sourceEl = getElNode(sourceEl);
        currentCharIndex = 0;
        evt = this.createEvent("keypress", "KeyboardEvent");
        fireChar = function() {
            var timeout = window.setTimeout(function() {
                if ( currentCharIndex < input.length ) {
                    evt.charCode = input.charCodeAt(currentCharIndex);
                    currentCharIndex++;
                    spec.fireEvent(sourceEl, evt);
                    fireChar();
                } else {
                    window.clearTimeout(timeout);
                }
            }, 100);
        };
        fireChar();
    };
})(spec);

