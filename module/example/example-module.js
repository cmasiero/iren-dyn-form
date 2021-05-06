"use strict"
class ExampleClass{
    constructor(name){
        this.name = name;
    }
    show(){
        console.log("[ExampleClass:show]" + this.name);
    }
}


module.exports = {
    //ExampleClass: ExampleClass
    ExampleClass
}

/*
// CommonJS module like.
export default {
    //ExampleClass: ExampleClass
    ExampleClass
}
*/