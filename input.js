{ //Slot re-reformed
            function InputSlot(id, type, label, input) {
                var that = this;
                this.id = id;
                this.type = type;
                this.label = label;
                this.element = null;
                this.lbox = null;
                this.rbox = null;
                this.input = input;
            }

            function newInputSlot(id=null, target, label, type, input) {
                if(id==null){
                    id = ++inputIds;
                }
                var slot = new InputSlot(id, type, label, input);
                target.appendChild(new Range().createContextualFragment('' +
                    '<div class="input_slot" id="is' + slot.id + '">' +
                        '<div class="input_slot_box">' +
                            '<div class="input_slot_label">' + label + '</div>' +
                        '</div>' +
                        '<div class="input_slot_box">' +
                        '</div>' +
                    '</div>'));
                slot.element = document.getElementById('is' + slot.id);
                slot.lbox = slot.element.getElementsByClassName('input_slot_label')[0];
                slot.rbox = slot.element.getElementsByClassName('input_slot_box')[1];
                inputSlots.push(slot);
                return slot;
            }
        }

        { //Interceptor re-reformed
            function Interceptor() {
                var that = this;
                this.onMouseDown = function() {};
                this.onMouseUp = function() {};
                this.onClick = function() {};
                this.onMouseMove = function() {};
                this.onKeyUp = function() {};
                this.prevPos = {
                    x: 0,
                    y: 0
                };
                this.element = null;
                this.inputObj = null;
            }

            function newInterceptor(receiver) {
                var interceptor = new Interceptor();
                currentZIndex++;
                document.body.appendChild(new Range().createContextualFragment('' +
                    '<div id="interceptor' + currentZIndex + '" class="interceptor" style="z-index:' + currentZIndex + ';"></div>'));
                interceptor.inputObj = receiver;
                interceptor.element = document.getElementById('interceptor' + currentZIndex);
                interceptor.element.addEventListener("mousedown", function(e) {
                    interceptor.onMouseDown(e)
                });
                interceptor.element.addEventListener("mouseup", function(e) {
                    interceptor.onMouseUp(e)
                });
                interceptor.element.addEventListener("click", function(e) {
                    interceptor.onClick(e)
                });
                interceptor.element.addEventListener("mousemove", function(e) {
                    interceptor.onMouseMove(e)
                });
                interceptors.push(interceptor);
                return interceptor;
            }

            window.onkeyup = function(e){
                for(var i=0;i<interceptors.length;i++){
                    interceptors[i].onKeyUp(e);
                }
            }

            function destroyInterceptor() {
                var interceptor = interceptors.pop();
                document.body.removeChild(interceptor.element);
                currentZIndex--;
                interceptors
                delete interceptor;
            }
        }

        { //Bool re-reformed
            function InputBool(id, label, value = false) {
                var that = this;
                this.id = id;
                this.type = 'bool';
                this.label = label;
                this.value = value;
                this.element = null;
                this.onChange = function() {};
                this.onTrue = function() {};
                this.onFalse = function() {};
                this.toggle = function() {
                    e = this.element;
                    if (e.firstElementChild.style.left == '0%') {
                        e.firstElementChild.style.left = '50%';
                        e.classList.toggle('bg_dis', false);
                        e.classList.toggle('bg_sec', true);
                        this.value = true;
                    } else {
                        e.firstElementChild.style.left = '0%';
                        e.classList.toggle('bg_sec', false);
                        e.classList.toggle('bg_dis', true);
                        this.value = false;
                    }
                    this.onChange();
                    if (this.value) {
                        this.onTrue();
                    } else {
                        this.onFalse();
                    }
                };
            }

            function newInputBool(target, label='', value = false, makeSlot=false, options) { //options for Bool are: function onChange, function onTrue, function onFalse
                var input = new InputBool(++inputIds, label, value);
                if(makeSlot){
                    target = newInputSlot(input.id, target, label, 'bool', input).rbox;
                }
                target.appendChild(new Range().createContextualFragment(''
                    + '<div id="i' + input.id + '" class="input_bool_pill ' + (value ? "bg_sec" : "bg_dis") + ' bg_hl">'
                        + '<div class="input_bool_ball" style="left:' + (value ? '50%' : '0%') + '"></div>'
                    + '</div>'));
                input.element = document.getElementById("i"+input.id);
                input.element.addEventListener("click", function(e) {
                    input.toggle(e)
                });
                if(options.onChange != null){
                    input.onChange = options.onChange;
                }
                if(options.onTrue != null){
                    input.onTrue = options.onTrue;
                }
                if(options.onFalse != null){
                    input.onFalse = options.onFalse;
                }
                return input;
            }
        }

        { //Text re-reformed
            function InputText(id, label, value = '') {
                var that = this;
                this.id = id;
                this.type = 'text';
                this.label = label;
                this.value = value;
                this.element = null;
                this.change = function() {
                    this.value = this.element.value;
                    this.onChange();
                    if (this.value == '') {
                        this.onEmpty();
                    } else {
                        this.onFilled();
                    }
                }
                this.onChange = function() {};
                this.onEmpty = function() {};
                this.onFilled = function() {};
            }

            function newInputText(target, label='', value = false, makeSlot=false, options) {  //options for Text are: function onChange, function onEmpty, function onFilled, string placeholder
                var input = new InputText(++inputIds, label, value);
                if(makeSlot){
                    target = newInputSlot(input.id, target, label, 'text', input).rbox;
                }
                target.appendChild(new Range().createContextualFragment(''
                    + '<input type="text" id="i' + input.id + '" class="input_text" value="' + value + '" placeholder="' + (options.placeholder!=null?options.placeholder:'') + '"/>'));
                input.element = document.getElementById("i"+input.id);
                input.element.addEventListener("input", function(e) {
                    input.change(e)
                });
                if(options.onChange != null){
                    input.onChange = options.onChange;
                }
                if(options.onEmpty != null){
                    input.onEmpty = options.onEmpty;
                }
                if(options.onFilled != null){
                    input.onFilled = options.onFilled;
                }
                return input;
            }
        }

        { //Range re-reformed

            function InputRange(id, label, value = '', min = 0, max = 100, decimals = 0, step = 1, prefix = '', suffix = '') {
                var that = this;
                this.id = id;
                this.type = 'range';
                this.label = label;
                this.value = value;
                this.element = null;
                this.bar = null;
                this.text = null;
                this.min = min;
                this.max = max;
                this.decimals = decimals;
                this.step = step;
                this.prefix = prefix;
                this.suffix = suffix;
                this.rect = null;
                this.onChange = function(e){};
                this.onBeginSliding =function(e){};
                this.onSliding = function(e){};
                this.onEndSliding = function(e){};
                this.onBeginEditing = function(e){};
                this.onEditing = function(e){};
                this.onEndEditing = function(e){};
                this.onMax = function(e){};
                this.onMin = function(e){};
                this.clickTimeout = true;
                this.clickStart = {x: 0, y: 0};
                this.mouseDeltaVector = function(e) {
                    var x = this.clickStart.x - e.clientX;
                    var y = this.clickStart.y - e.clientY;
                    return Math.sqrt(x * x + y * y);
                };
                this.textFormat = function() {
                    var detectedValue = parseFloat(this.text.textContent.replace(this.prefix, ""));
                    if (!isNaN(detectedValue)) {
                        if (detectedValue < this.min) {
                            detectedValue = this.min;
                        } else if (detectedValue > this.max) {
                            detectedValue = this.max;
                        }
                    } else {
                        if(this.text.textContent.replace("|", "").replace(this.prefix, "").replace(this.suffix,"")==""){
                            detectedValue = this.min;
                        }else{
                            detectedValue = this.value;
                        }
                    }
                    this.text.textContent = this.prefix + (Math.round(detectedValue / this.step) * this.step).toFixed(this.decimals) + this.suffix;
                    detectedValue = parseFloat(this.text.textContent.replace(this.prefix, ""));
                    this.bar.style.width = ((detectedValue - this.min) * this.rect.width / (this.max - this.min)) + "px";
                    if(detectedValue != this.value){
                        this.value = detectedValue;
                        this.onChange();
                        if(this.value == this.max){
                            this.onMax();
                        }else if(this.value == this.min){
                            this.onMin();
                        }
                    }
                };
                this.update = function(){
                    // console.log("range update");
                    this.text.textContent = this.value;
                    this.onChange();
                    if(this.value == this.max){
                        this.onMax();
                    }else if(this.value == this.min){
                        this.onMin();
                    }
                    this.textFormat();
                }
                this.blinker = function() {
                    if (that.element.children[0].children[0].textContent.includes("|")) {
                        // console.log("blinker remove");
                        that.element.children[0].children[0].textContent = that.element.children[0].children[0].textContent.replace("|", "");
                    } else {
                        // console.log("blinker add");
                        that.element.children[0].children[0].textContent = that.element.children[0].children[0].textContent.replace(that.suffix, "|"+that.suffix);
                    }
                };
                this.beginSliding = function(e) {
                    // console.log("range begin sliding");
                    if(e.button==0){
                        this.clickTimeout = false;
                        setTimeout(function() {
                            that.clickTimeout = true;
                        }, 350);
                        this.clickStart = {
                            x: e.clientX,
                            y: e.clientY
                        };
                        var interceptor = newInterceptor(this);
                        interceptor.onMouseUp = function(e) {
                            destroyInterceptor();
                            if (this.inputObj.clickTimeout || this.inputObj.mouseDeltaVector(e) > 4) {
                                this.inputObj.endSliding(e);
                            } else {
                                this.inputObj.beginEditing(e);
                            }
                        };
                        interceptor.onMouseMove = function(e) {
                            interceptor.inputObj.sliding(e)
                        };
                        this.prevValue = this.value;
                        this.onBeginSliding();
                    }
                };
                this.sliding = function(e) {
                    // console.log("range sliding");
                    this.bar.style.width = (e.clientX < this.rect.left ? 0 : (e.clientX - this.rect.left > this.rect.width ? this.rect.width : (e.clientX - this.rect.left))) + "px";
                    this.text.textContent /*+*/= (Math.round(((this.bar.getBoundingClientRect().width * (this.max - this.min)) / this.rect.width) / this.step) * this.step).toFixed(this.decimals);
                    this.textFormat();
                    this.onSliding();
                };
                this.endSliding = function(e) {
                    // console.log("range end sliding");
                    this.onEndSliding();
                };
                this.beginEditing = function(e) {
                    // console.log("begin editing");
                    this.value = this.prevValue;
                    this.bar.classList.toggle("active", true);
                    var interceptor = newInterceptor(this);
                    interceptor.onKeyUp = function(e) {
                        interceptor.inputObj.editing(e)
                    };
                    interceptor.onClick = function(e) {
                        interceptor.inputObj.endEditing(e);
                    };
                    this.blinkerInterval = setInterval(this.blinker, 400);
                    this.onBeginEditing();
                };
                this.editing = function(e) {
                    // console.log("range editing");
                    this.text.textContent = this.text.textContent.replace("|", "").replace(this.prefix, "").replace(this.suffix,"");
                    switch (e.key) {
                        case "0": case "1": case "2": case "3": case "4": case "5": case "6":
                        case "7": case "8": case "9": case ".": case ",": case "%": case "-":
                            that.element.children[0].children[0].textContent += e.key;
                            break;
                        case "Backspace":
                            this.text.textContent = this.text.textContent.slice(0, this.text.textContent.length - 1);
                            break;
                        case "Enter":
                            this.endEditing();
                            break;
                    }
                    this.textFormat();
                    this.onEditing();
                };
                this.endEditing = function(e) {
                    // console.log("range end editing");
                    destroyInterceptor();
                    this.bar.classList.toggle("active", false);
                    clearInterval(this.blinkerInterval);
                    this.textFormat();
                    this.onEndEditing();
                };
            }

            function newInputRange(target, label='', value = false, makeSlot=false, options) { //options for Bool are: number min, number max, int decimals, number step, string prefix, string suffix, function onChange, function onBeginSliding, function onSliding, function onEndSliding, function onBeginEditing, function onEditing, function onEndEditing, function onMax, function onMin
                var input = new InputRange(++inputIds, label, value, options.min, options.max, options.decimals, options.step, options.prefix, options.suffix);
                if(makeSlot){
                    target = newInputSlot(input.id, target, label, 'range', input).rbox;
                }
                target.appendChild(new Range().createContextualFragment(''
                    + '<div id="i' + input.id + '" class="input_range">'
                        + '<div class="input_range_slider bg_sec bg_hl" style="width:' + ((input.value - input.min) * 220 / (input.max - input.min)) + 'px">'
                            + '<div class="input_range_text">' + input.prefix + input.value + input.suffix + '</div>'
                        + '</div>'
                    + '</div>'));
                input.element = document.getElementById("i"+input.id);
                input.bar = input.element.children[0];
                input.text = input.element.children[0].children[0];
                input.rect = input.element.getBoundingClientRect();
                if(options.onChange != null){
                    input.onChange = options.onChange;
                }
                if(options.onBeginSliding != null){
                    input.onBeginSliding = options.onBeginSliding;
                }
                if(options.onSliding != null){
                    input.onSliding = options.onSliding;
                }
                if(options.onEndSliding != null){
                    input.onEndSliding = options.onEndSliding;
                }
                if(options.onBeginEditing != null){
                    input.onBeginEditing = options.onBeginEditing;
                }
                if(options.onEditing != null){
                    input.onEditing = options.onEditing;
                }
                if(options.onEndEditing != null){
                    input.onEndEditing = options.onEndEditing;
                }
                if(options.onMax != null){
                    input.onMax = options.onMax;
                }
                if(options.onMin != null){
                    input.onMin = options.onMin;
                }
                input.element.addEventListener("mousedown", function(e) {
                    input.beginSliding(e)
                });
                return input;
            }
        }

        { //HorzEnum re-reformed
            function InputHorzEnum(id, label, value = 0, loop=false, values) {
                var that = this;
                this.id = id;
                this.type = 'horzenum';
                this.label = label;
                this.value = value;
                this.element = null;
                this.scroller = null;
                this.lbutton = null;
                this.rbutton = null;
                this.values = values;
                this.loop = loop;
                this.onChange = function() {};
                this.onGoLeft = function() {};
                this.onGoRight = function() {};
                this.onLoop = function() {};
                this.onLoopLeft = function() {};
                this.onLoopRight = function() {};
                this.getValueString = function(){
                    return this.values[this.value];
                };
                this.change = function(e, right){
                    // console.log("horz enum change "+right+" "+this.loop);
                    if(e.button==0){
                        if(right){
                            if(this.value+1>=this.values.length){
                                if(this.loop){
                                    this.value = 0;
                                    this.onChange();
                                    this.onGoRight();
                                    this.onLoop();
                                    this.onLoopRight();
                                }
                            }else{
                                this.value += 1;
                                this.onChange();
                                this.onGoRight();
                            }
                        }else{
                            if(this.value-1<0){
                                if(this.loop){
                                    this.value = this.values.length-1;
                                    this.onChange();
                                    this.onGoLeft();
                                    this.onLoop();
                                    this.onLoopLeft();
                                }
                            }else{
                                this.value -= 1;
                                this.onChange();
                                this.onGoLeft();
                            }
                        }
                    }
                    this.scroller.style.transition = "left 500ms";
                    this.scroller.style.left = (-this.rect.width*this.value)+"px";
                    if (this.value == 0) {
                        if(!loop){ //disable left button
                            this.lbutton.classList.toggle("bg_sec", false);
                            this.lbutton.classList.toggle("bg_hl", false);
                            this.lbutton.classList.toggle("bg_dis", true);
                        }
                    }else{ //enable left button
                        this.lbutton.classList.toggle("bg_sec", true);
                        this.lbutton.classList.toggle("bg_hl", true);
                        this.lbutton.classList.toggle("bg_dis", false);
                    }
                    if (this.value == this.values.length-1) {
                        if(!loop){ //disable right button
                            this.rbutton.classList.toggle("bg_sec", false);
                            this.rbutton.classList.toggle("bg_hl", false);
                            this.rbutton.classList.toggle("bg_dis", true);
                        }
                    }else{ //enable right button
                        this.rbutton.classList.toggle("bg_sec", true);
                        this.rbutton.classList.toggle("bg_hl", true);
                        this.rbutton.classList.toggle("bg_dis", false);
                    }
                };
            }

            function newInputHorzEnum(target, label='', value = 0, makeSlot=false, options) { //options for HorzEnum are: Array<String> values, bool loop, function onChange, function onGoLeft, function onGoRight, function onLoop, function onLoopLeft, function onLoopRight
                if(isNaN(value)) {
                    value = options.values.indexOf(value);
                }
                var input = new InputHorzEnum(++inputIds, label, value, options.loop, options.values);
                if(makeSlot){
                    target = newInputSlot(input.id, target, label, 'horzenum', input).rbox;
                }
                var semiproduct = ''
                        + '<div id="i' + input.id + '" class="input_horzenum">'
                            + '<div class="input_horzenum_button input_horzenum_left '+ (input.value <= 0 && !input.loop ? 'bg_dis' : 'bg_sec bg_hl') +'">'
                                + '<svg>'
                                    + '<polygon points="10,17 20,10 20,24"/>'
                                + '</svg>'
                            + '</div>'
                            + '<div class="input_horzenum_cell">'
                                + '<div class="input_horzenum_scroller">';
                for (var i = 0; i < input.values.length; i++) {
                    semiproduct += '<div class="input_horzenum_value">' + input.values[i] + '</div>';
                }
                target.appendChild(new Range().createContextualFragment(semiproduct
                                + '</div>'
                            + '</div>'
                            + '<div class="input_horzenum_button input_horzenum_right '+ (input.value >= input.values.length - 1 && !input.loop ? 'bg_dis' : 'bg_sec bg_hl') +'">'
                                + '<svg>'
                                    + '<polygon points="10,10 20,17 10,24"/>'
                                + '</svg>'
                        + '</div>'));
                input.element = document.getElementById("i"+input.id);
                input.scroller = input.element.getElementsByClassName("input_horzenum_scroller")[0];
                input.lbutton = input.element.getElementsByClassName("input_horzenum_left")[0];
                input.rbutton = input.element.getElementsByClassName("input_horzenum_right")[0];
                input.rect = input.element.getElementsByClassName("input_horzenum_cell")[0].getBoundingClientRect();
                input.scroller.style.width = (input.rect.width * input.values.length)+"px";
                input.scroller.style.left = (-input.rect.width * input.value)+"px";
                input.lbutton.addEventListener("click", function(e) {
                    input.change(e, false);
                });
                input.rbutton.addEventListener("click", function(e) {
                    input.change(e, true);
                });
                if(options.onChange != null){
                    input.onChange = options.onChange;
                };
                if(options.onGoLeft != null){
                    input.onGoLeft = options.onGoLeft;
                };
                if(options.onGoRight != null){
                    input.onGoRight = options.onGoRight;
                };
                if(options.onLoop != null){
                    input.onLoop = options.onLoop;
                };
                if(options.onLoopLeft != null){
                    input.onLoopLeft = options.onLoopLeft;
                };
                if(options.onLoopRight != null){
                    input.onLoopRight = options.onLoopRight;
                };
                return input;
            }
        }

        { //VertEnum re-reformed
            function InputVertEnum(id, label, value = 0, values) {
                var that = this;
                this.id = id;
                this.type = 'vertenum';
                this.label = label;
                this.value = value;
                this.element = null;
                this.cell = null;
                this.scroller = null;
                this.button = null;
                this.values = values;
                this.onChange = function() {};
                this.mouseDeltaVector = function(e) {
                    return Math.abs(this.clickStart.y - e.clientY);
                };
                this.getValueString = function(){
                    return this.values[this.value];
                };
                this.beginDragging = function(e){
                    // console.log("vert enum begin dragging");
                    if(e.button==0){
                        this.clickTimeout = false;
                        setTimeout(function() {
                            that.clickTimeout = true;
                        }, 350);
                        this.clickStart = {y: e.clientY};
                        this.clickLast = {y: e.clientY};
                        this.open();
                        this.rect = this.cell.getBoundingClientRect();
                        this.interceptor = newInterceptor(that);
                        this.interceptor.onMouseMove = function(e){
                            this.inputObj.dragging(e);
                        };
                        this.interceptor.onMouseUp = function(e){
                            destroyInterceptor();
                            if (this.inputObj.clickTimeout || this.inputObj.mouseDeltaVector(e) > 4) {
                                this.inputObj.endDragging(e);
                                this.inputObj.onChange(e);
                            } else {
                                this.inputObj.endDragging(e);
                                this.inputObj.interceptor = newInterceptor(this.inputObj);
                                this.inputObj.open(e);
                                this.inputObj.interceptor.onClick = function(e){
                                    this.inputObj.click(e, false);
                                }
                            }
                        };
                    }
                };
                this.dragging = function(e){
                    // console.log("vert enum dragging");
                    this.overlayScroller.children[this.value].classList.toggle("active", false);
                    var newTop = (parseFloat(this.overlayScroller.style.top) + (e.clientY - this.clickLast.y));
                    var maxTop = this.rect.top + window.scrollY;
                    var minTop = maxTop - this.rect.height * (this.values.length - 1);
                    newTop = newTop < minTop ? minTop : newTop > maxTop ? maxTop : newTop;
                    this.overlayScroller.style.top = (newTop) + "px";
                    this.scroller.style.top = (newTop - this.rect.top - window.scrollY) + "px";
                    this.value = Math.floor((this.rect.height/2 + this.rect.top - newTop + window.scrollY)/this.rect.height);
                    this.overlayScroller.children[this.value].classList.toggle("active", true);
                    this.clickLast.y = e.clientY;
                };
                this.endDragging = function(e){
                    // console.log("vert enum end dragging");
                    document.body.removeChild(this.overlayScroller);
                    this.scroller.style.top = (-this.rect.height*this.value)+"px";
                    currentZIndex++;
                };
                this.open = function(e){
                    // console.log("vert enum open");
                    currentZIndex++;
                    var semiproduct = '<div class="input_vertenum_overlayscroller" style="z-index:' + currentZIndex + ';">';
                    for (var i = 0; i < this.values.length; i++) {
                        semiproduct += '<div class="input_vertenum_value bg_sec bg_hl">' + this.values[i] + '</div>';
                    }
                    document.body.appendChild(new Range().createContextualFragment(semiproduct + '</div>'));
                    this.overlayScroller = document.getElementsByClassName("input_vertenum_overlayscroller")[0];
                    this.overlayScroller.style.transition = "top 0ms";
                    this.overlayScroller.style.height = (this.rect.height * this.values.length) + "px";
                    this.overlayScroller.style.top = (this.scroller.getBoundingClientRect().top + window.scrollY) + "px";
                    this.overlayScroller.style.left = (this.scroller.getBoundingClientRect().left + window.scrollX) + "px";
                    for(var i=0;i<this.overlayScroller.getElementsByClassName("input_vertenum_value").length; i++){
                        this.overlayScroller.getElementsByClassName("input_vertenum_value")[i].addEventListener("click", function(e){
                            that.click(e, true);
                        });
                    }
                };
                this.click = function(e, select){
                    // console.log("vert enum click");
                    if(select==true){
                        for (var i = 0; i < this.values.length; i++) {
                            if (e.currentTarget.textContent == this.values[i]) {
                                this.value = i;
                            }
                        }
                        this.onChange(e);
                    }
                    document.body.removeChild(this.overlayScroller);
                    this.scroller.style.top = (-this.rect.height*this.value)+"px";
                    destroyInterceptor();
                };
            }

            function newInputVertEnum(target, label='', value = 0, makeSlot=false, options) { //options for VertEnum are: Array<String> values, function onChange
                if(isNaN(value)) {
                    value = options.values.indexOf(value);
                }
                var input = new InputVertEnum(++inputIds, label, value, options.values);
                if(makeSlot){
                    target = newInputSlot(input.id, target, label, 'vertenum', input).rbox;
                }
                var semiproduct = ''
                    + '<div id="i' + input.id + '" class="input_vertenum">'
                        + '<div class="input_vertenum_cell">'
                            + '<div class="input_vertenum_scroller">';
                for (var i = 0; i < input.values.length; i++) {
                    semiproduct += '<div class="input_vertenum_value">' + input.values[i] + '</div>';
                }
                target.appendChild(new Range().createContextualFragment(semiproduct
                            + '</div>'
                        + '</div>'
                        + '<div class="input_vertenum_button bg_sec bg_hl">'
                            + '<svg>'
                                + '<polygon points="10,13 21,13 16,6"/>'
                                + '<polygon points="10,21 21,21 16,28"/>'
                            + '</svg>'
                        + '</div>'
                    + '</div>'));
                input.element = document.getElementById("i"+input.id);
                input.cell = input.element.getElementsByClassName("input_vertenum_cell")[0];
                input.scroller = input.element.getElementsByClassName("input_vertenum_scroller")[0];
                input.button = input.element.getElementsByClassName("input_vertenum_button")[0];
                input.rect = input.cell.getBoundingClientRect();
                input.scroller.style.height = (input.rect.height * input.values.length)+"px";
                input.scroller.style.top = (-input.rect.height * input.value)+"px";
                input.element.addEventListener("mousedown", function(e) {
                    input.beginDragging(e);
                });
                if(options.onChange != null){
                    input.onChange = options.onChange;
                };
                return input;
            }
        }

        { //Color re-reformed
            //in its blur form, it's a cell-like element, with hex text inside and the right color as background
            //on click, it generates an interceptor, it copies itself on top of it, it activates allowing you to type a new hex and opens a panel containing colorwheel, rgb/hsv switch and the three ranges
                //on click outside of the panel (thus on the interceptor) will fire a parse of the bars (that should always work) and close both panel, cell and interceptor
                //if active for typing, on enter, it fires a parse of the hex text and if it fails, it restores the previous value, then closes both panel, cell and interceptor
                //on click over the cell will activate the cell for typing
                //on interaction with a bar will fire a parse of the bars and update values of colorwheel and cell
                //on interaction with the colorwheel will fire a parse of the colorwheel and update parse of bars and cell
                //on click on the rgb/hsv switch will edit the bars accordingly

            function InputColor(id, label, value = '#ffffff', allowAlpha = false) {
                var that = this;
                this.id = id;
                this.type = 'color';
                this.label = label;
                this.allowAlpha = allowAlpha;
                this.r = parseInt(value.slice(1,3), 16);
                this.g = parseInt(value.slice(3,5), 16);
                this.b = parseInt(value.slice(5,7), 16);
                this.a = this.allowAlpha?parseInt(value.slice(7,9), 16):255;
                this.hsv = false;
                this.element = null;
                this.onChange = function(){};
                this.getrgb = function(){
                    return {"r":this.r,"g":this.g,"b":this.b};
                };
                this.getrgba = function(){
                    return {"r":this.r,"g":this.g,"b":this.b,"a":this.a};
                };
                this.gethsv = function() {
                    return rgb2hsv(this.r, this.g, this.b);
                };
                this.gethsva = function() {
                    var hsv = rgb2hsv(this.r, this.g, this.b);
                    hsv.a = this.a;
                    return hsv;
                };
                this.setrgb = function(r,g,b){
                    this.r = r;
                    this.g = g;
                    this.b = b;
                };
                this.setrgba = function(r,g,b,a){
                    this.r = r;
                    this.g = g;
                    this.b = b;
                    this.a = this.allowAlpha?a:255;
                };
                this.sethsv = function(h,s,v){
                    var rgb = hsv2rgb(h,s,v);
                    this.r = rgb.r;
                    this.g = rgb.g;
                    this.b = rgb.b;
                };
                this.sethsva = function(h,s,v,a){
                    var rgb = hsv2rgb(h,s,v);
                    this.r = rgb.r;
                    this.g = rgb.g
                    this.b = rgb.b;
                    this.a = this.allowAlpha?a:255;
                };
                this.getValueString = function(values=null, allowAlpha=null){
                    if(values==null){
                        values = this.getrgba();
                    }
                    if(allowAlpha==null){
                        allowAlpha = this.allowAlpha;
                    }
                    var t = values.r.toString(16);
                    t = t.length<2?'0'+t:t;
                    var s = t;
                    var t = values.g.toString(16);
                    t = t.length<2?'0'+t:t;
                    s += t;
                    var t = values.b.toString(16);
                    t = t.length<2?'0'+t:t;
                    s += t;
                    if(allowAlpha){
                        if(values.a!=null){
                            var t = values.a.toString(16);
                            t = t.length<2?'0'+t:t;
                            s += t;
                        }else{
                            s += 'FF';
                        }
                    }
                    return '#'+s.toUpperCase();
                };
                this.parseHex = function (){
                    //console.log("color parse hex");
                    var detectedValue = this.cell.children[1].textContent.replace('#', '');
                    if(detectedValue.length==(this.allowAlpha?8:6)){
                        this.r = parseInt(detectedValue.slice(0,2), 16);
                        this.g = parseInt(detectedValue.slice(2,4), 16);
                        this.b = parseInt(detectedValue.slice(4,6), 16);
                        this.a = this.allowAlpha?parseInt(detectedValue.slice(6,8), 16):255;
                    }
                    this.onChange();
                    this.updateAll(this.getrgba());
                };
                this.parseBars = function (){
                    //console.log("color parse bars");
                    if(this.hsv){
                        var rgb = hsv2rgb(this.bar0.value, this.bar1.value, this.bar2.value);
                        this.r = rgb.r;
                        this.g = rgb.g;
                        this.b = rgb.b;
                    }else{
                        this.r = this.bar0.value;
                        this.g = this.bar1.value;
                        this.b = this.bar2.value;
                    }
                    if(this.allowAlpha){
                        this.a = this.bar3.value;
                    }
                    this.onChange();
                    this.updateHex(this.getrgba());
                    this.updateWheel(this.getrgba());
                };
                this.parseWheel = function (){
                    // console.log("color parse wheel");
                    var rgb = this.wheel.getrgb();
                    this.r = rgb.r;
                    this.g = rgb.g;
                    this.b = rgb.b;
                    this.updateHex(this.getrgba());
                    this.updateBars(this.getrgba());
                    this.onChange();
                };
                this.updateAll = function(values){
                    this.updateBars(values);
                    this.updateWheel(values);
                    this.updateHex(values);
                };
                this.updateBars = function(values){
                    // console.log("color update bars");
                    // values = value.replace('#','');
                    // var r = parseInt(value.slice(0,2),16);
                    // var g = parseInt(value.slice(2,4),16);
                    // var b = parseInt(value.slice(4,6),16);
                    if(values==null){
                        values = this.getrgba();
                    }
                    if(this.hsv){
                        var hsv = rgb2hsv(values.r,values.g,values.b);
                        this.bar0.value = hsv.h;
                        this.bar1.value = hsv.s;
                        this.bar2.value = hsv.v;
                    }else{
                        this.bar0.value = values.r;
                        this.bar1.value = values.g;
                        this.bar2.value = values.b;
                    }
                    this.bar0.update();
                    this.bar1.update();
                    this.bar2.update();
                    if(this.allowAlpha){
                        this.bar3.value = values.a;
                        this.bar3.update();
                    }
                };
                this.updateWheel = function(values){ //TODO
                    // console.log("color update wheel");
                    if(values==null){
                        values = this.getrgb();
                    }
                    this.wheel.setrgb(values.r,values.g,values.b);
                };
                this.updateHex = function(values){
                    // console.log("color update hex");
                    if(values==null){
                        values = this.getrgba();
                    }
                    this.element.children[1].textContent = this.getValueString(values);
                    this.element.children[1].style.color = (values.r+values.g+values.b/2)>=255?'#000000':'#ffffff';
                    this.element.children[0].style.backgroundColor = this.getValueString(values, false);
                    if(this.allowAlpha){
                        this.element.children[0].style.opacity = values.a/255;
                    }
                    if(this.cell != null){
                        this.cell.children[1].textContent = this.getValueString(values);
                        this.cell.children[1].style.color = (values.r+values.g+values.b/2)>=255?'#000000':'#ffffff';
                        this.cell.children[0].style.backgroundColor = this.getValueString(values, false);
                        if(this.allowAlpha){
                            this.cell.children[0].style.opacity = values.a/255;
                        }
                    }
                };
                this.blinker = function() {
                    if (that.cell.children[1].textContent.includes("|")) {
                        that.cell.children[1].textContent = that.cell.children[1].textContent.replace("|", "");
                    } else {
                        that.cell.children[1].textContent += "|";
                    }
                };
                this.openPanel = function(e){
                    // console.log("color open panel");
                    var interceptor = newInterceptor(this);
                    interceptor.onClick = function(e){
                        destroyInterceptor();
                        this.inputObj.closePanel(e);
                    }
                    this.interceptor = interceptor;
                    currentZIndex++;
                    var rect = this.element.getBoundingClientRect();
                    document.body.appendChild(new Range().createContextualFragment(''
                        + '<div id="input_color_cell" class="input_color_cell" style="z-index:' + currentZIndex + '; width:'+rect.width+'px; top:'+(rect.top+window.scrollY)+'px; left:'+(rect.left+window.scrollX)+'px;">'
                            + '<div class="input_color_bg" style="background-color:'+this.getValueString(null, false)+'; opacity:'+(this.allowAlpha?this.a/255:1.0)+';"></div>'
                            + '<div class="input_color_text">'+this.getValueString()+'</div>'
                        + '</div>'));
                    this.cell = document.getElementById("input_color_cell");
                    this.cell.onclick = function(e){
                        that.beginEditing(e);
                    };
                    document.body.appendChild(new Range().createContextualFragment(''
                        + '<div id="input_color_panel" class="input_color_panel bg_pri brd_txt" style="z-index:' + currentZIndex + '; top:'+(rect.top+rect.height+window.scrollY)+ 'px; left:'+(rect.left+window.scrollX)+'px;">'
                            + '<div class="input_color_wheelpanel"></div>'
                            + '<div class="input_color_switchpanel">'
                                + '<div>RGB</div>'
                                + '<div></div>'
                                + '<div>HSV</div>'
                            +' </div>'
                            + '<div class="input_color_barspanel"></div>'
                        + '</div>'));
                    this.panel = document.getElementById("input_color_panel");
                    this.wheel = newColorWheel(this.panel.getElementsByClassName("input_color_wheelpanel")[0], this.getValueString(null, false), 100, 4, true);
                    this.wheel.onChange = function(){
                        that.parseWheel();
                    }
                    this.hsv = false;
                    var rgbhsv = newInputBool(this.panel.getElementsByClassName("input_color_switchpanel")[0].children[1],'rgbhsv',false,false,{"onChange":function(e){
                            that.hsv = rgbhsv.value;
                            if(that.hsv){
                                that.bar0.prefix = 'Hue: ';
                                that.bar1.prefix = 'Saturation: ';
                                that.bar2.prefix = 'Value: ';
                                that.bar0.label = 'h';
                                that.bar1.label = 's ';
                                that.bar2.label = 'v';
                                that.bar0.max = 360;
                                that.bar1.max = 100;
                                that.bar2.max = 100;
                            }else{
                                that.bar0.prefix = 'Red: ';
                                that.bar1.prefix = 'Green: ';
                                that.bar2.prefix = 'Blue: ';
                                that.bar0.label = 'r';
                                that.bar1.label = 'g';
                                that.bar2.label = 'b';
                                that.bar0.max = 255;
                                that.bar1.max = 255;
                                that.bar2.max = 255;
                            }
                            that.updateBars(that.getrgba());
                        }});
                    for(var i=0;i<(this.allowAlpha?4:3);i++){
                        var bar = newInputRange(this.panel.getElementsByClassName("input_color_barspanel")[0], i==0?'r':i==1?'g':i==2?'b':'a', i==0?this.r:i==1?this.g:i==2?this.b:this.a, false, {"max":255, "prefix": i==0?'Red: ':i==1?'Green: ':i==2?'Blue: ':'Alpha: ', "onChange":function(e){that.parseBars()},"onBeginSliding":function(e){that.endEditing();}})
                        switch(i){
                            case 0:
                                this.bar0 = bar;
                                break;
                            case 1:
                                this.bar1 = bar;
                                break;
                            case 2:
                                this.bar2 = bar;
                                break;
                            case 3:
                                this.bar3 = bar;
                                break;
                        }
                    }

                    this.beginEditing(e);
                };
                this.closePanel = function(e){
                    // console.log("color close panel");
                    //this.endEditing(); //?
                    document.body.removeChild(this.cell);
                    document.body.removeChild(this.panel);
                    currentZIndex--;
                };
                this.beginEditing = function(e) {
                    if(this.blinkerInterval==null){
                        // console.log("color begin editing");
                        this.cell.children[1].textContent = this.getValueString();
                        this.parseHex();
                        this.cell.children[1].textContent = "#";
                        this.interceptor.onKeyUp = function(e) {
                            that.interceptor.inputObj.editing(e)
                        };
                        this.interceptor.onMouseUp = function(e) {
                            that.interceptor.inputObj.endEditing(e)
                        };
                        this.blinkerInterval = setInterval(this.blinker, 400);
                    }
                };
                this.editing = function(e) {
                    // console.log("color editing");
                    this.cell.children[1].textContent = this.cell.children[1].textContent.replace("|", "");
                    switch (e.key) {
                        case "0": case "1": case "2": case "3": case "4": case "5": case "6": case "7":
                        case "8": case "9": case "A": case "B": case "C": case "D": case "E": case "F":
                        case "a": case "b": case "c": case "d": case "e": case "f":
                            this.cell.children[1].textContent += e.key.toUpperCase();
                            break;
                        case "Backspace":
                            this.cell.children[1].textContent = this.cell.children[1].textContent.slice(0, this.cell.children[1].textContent.length - 1);
                            break;
                        case "Enter":
                            this.endEditing();
                            this.parseHex();
                            break;
                    }
                };
                this.endEditing = function(e) {
                    // console.log("color end editing");
                    this.interceptor.onKeyUp = function(e) {
                        //nothing
                    };
                    clearInterval(this.blinkerInterval);
                    this.blinkerInterval = null;
                };
            }

            function rgb2hsv(r,g,b){
                r/=255.0; g/=255.0; b/=255.0;
                var max = Math.max(r, g, b), min = Math.min(r, g, b);
                var h, s, v = max;
                var d = max - min;
                s = max == 0 ? 0 : d / max;
                if (max == min) {
                    h = 0;
                } else {
                    switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }
                    h /= 6;
                }
                // console.log("rgb2hsv: "+h+" "+s+" "+v);
                return {"h":Math.round(h*360),"s":Math.round(s*100),"v":Math.round(v*100)};
            }

            function hsv2rgb(h,s,v){
                h/=360.0; s/=100.0; v/=100.0;
                var r, g, b;
                var i = Math.floor(h * 6);
                var f = h * 6 - i;
                var p = v * (1 - s);
                var q = v * (1 - f * s);
                var t = v * (1 - (1 - f) * s);

                switch (i % 6) {
                    case 0: r = v, g = t, b = p; break;
                    case 1: r = q, g = v, b = p; break;
                    case 2: r = p, g = v, b = t; break;
                    case 3: r = p, g = q, b = v; break;
                    case 4: r = t, g = p, b = v; break;
                    case 5: r = v, g = p, b = q; break;
                }
                // console.log("hsv2rgb: "+r+" "+g+" "+b);
                return {"r":Math.round(r*255),"g":Math.round(g*255),"b":Math.round(b*255)};
            }

            function newInputColor(target, label='', value = '#ffffff', makeSlot=false, options) { //options for Color are: bool allowAlpha, function onBeginDragging, function onDragging, function onEndDragging, function onBegingSliding, function on Sliding, function onEndSliding, function onChange
                var input = new InputColor(++inputIds, label, value, options.allowAlpha);
                if(makeSlot){
                    target = newInputSlot(input.id, target, label, 'color', input).rbox;
                }
                target.appendChild(new Range().createContextualFragment(''
                    + '<div id="i' + input.id + '" class="input_color_cell">'
                        + '<div class="input_color_bg" style="background-color:'+input.getValueString(null,false)+'; opacity:'+input.a/255+';"></div>'
                        + '<div class="input_color_text">' + input.getValueString() + '</div>'
                    + '</div>'));
                input.element = document.getElementById("i"+input.id);
                if(options.onChange != null){
                    input.onChange = options.onChange;
                }
                if(options.onBeginSliding != null){
                    input.onBeginSliding = options.onBeginSliding;
                }
                if(options.onSliding != null){
                    input.onSliding = options.onSliding;
                }
                if(options.onEndSliding != null){
                    input.onEndSliding = options.onEndSliding;
                }
                if(options.onBeginDragging != null){
                    input.onBeginDragging = options.onBeginDragging;
                }
                if(options.onDragging != null){
                    input.onDragging = options.onDragging;
                }
                if(options.onEndDragging != null){
                    input.onEndDragging = options.onEndDragging;
                }
                input.element.addEventListener("click", function(e) {
                    input.openPanel(e)
                });
                return input;
            }

            { //colorwheel
                function ColorWheel(radius=100, padding=0, quadres=false){ //should it memorize its value(s)?
                    var that = this;
                    this.radius = radius;
                    this.padding = padding;
                    this.h = 0;
                    this.s = 0;
                    this.v = 0;
                    this.element = null;
                    this.quadres = quadres;
                    this.onBeginDragging = function(e){};
                    this.onDragging = function(e){};
                    this.onEndDragging = function(e){};
                    this.onBeginSliding = function(e){};
                    this.onSliding = function(e){};
                    this.onEndSliding = function(e){};
                    this.onChange = function(e){};
                    this.getrgb = function(){
                        return hsv2rgb(this.h, this.s, this.v);
                    };
                    this.gethsv = function() {
                        return {"h":this.h,"s":this.s,"v":this.v};
                    };
                    this.setrgb = function(r,g,b){
                        var hsv = rgb2hsv(r,g,b);
                        this.h = hsv.h;
                        this.s = hsv.s;
                        this.v = hsv.v;
                        this.drawCursors();
                    };
                    this.sethsv = function(h,s,v){
                        this.h = h;
                        this.s = s;
                        this.v = v;
                        this.drawCursors();
                    };
                    this.getValueString = function(){
                        var rgb = this.getrgb();
                        var t = rgb.r.toString(16);
                        t = t.length<2?'0'+t:t;
                        var s = t;
                        var t = rgb.g.toString(16);
                        t = t.length<2?'0'+t:t;
                        s += t;
                        var t = rgb.b.toString(16);
                        t = t.length<2?'0'+t:t;
                        s += t;
                        return '#'+s.toUpperCase();
                    };
                    this.redraw = function(){
                        //draw wheel
                        var radius = this.radius*(this.quadres?2:1);
                        var diameter = this.radius*(this.quadres?4:2);
                        var width = diameter + this.padding*(this.quadres?4:2);
                        var height = width;
                        this.element.width = width;
                        this.element.height = height;
                        this.element.style.width = (width/(this.quadres?2:1))+"px";
                        this.element.style.height = (height/(this.quadres?2:1))+"px";
                        this.rect = this.element.getBoundingClientRect();
                        var cc = this.element.getContext('2d');
                        var imageData = cc.createImageData(width, height);
                        var pixels = imageData.data;
                        for (var i=this.padding*width*(this.quadres?8:4), y = 0; y < diameter; y++) {
                            i+=this.padding*(this.quadres?8:4);
                            for (var x = 0; x < diameter; x++) {
                                var rx = x-radius,
                                    ry = y-radius,
                                    d = Math.sqrt(rx*rx+ry*ry),
                                    rgb = hsv2rgb(
                                        90+360*(Math.atan2(ry, rx) + Math.PI) / (Math.PI*2),        // Hue
                                        100*d / (radius),                        // Saturation
                                        100                                                         // Value
                                    );
                                pixels[i++] = rgb.r;
                                pixels[i++] = rgb.g;
                                pixels[i++] = rgb.b;
                                pixels[i++] = d > radius ? 0 : 255;
                            }
                            i+=this.padding*(this.quadres?8:4);
                        }
                        this.bg = imageData;
                        cc.putImageData(this.bg, 0, 0);
                        //draw bar
                        var width = 12*(this.quadres?2:1);
                        this.barElement.width = width;
                        this.barElement.height = height;
                        this.barElement.style.width = (width/(this.quadres?2:1))+"px";
                        this.barElement.style.height = (height/(this.quadres?2:1))+"px";
                        this.barRect = this.barElement.getBoundingClientRect();
                        var cc = this.barElement.getContext('2d');
                        var imageData = cc.createImageData(width, height);
                        var pixels = imageData.data;
                        for (var i=this.padding*width*(this.quadres?8:4), y = 0; y < diameter; y++) {
                            for (var x = 0; x < width; x++) {
                                var rx = x-(width/2),
                                    ry = Math.abs(y-radius)-(radius-(width/2)),
                                    d = Math.sqrt(rx*rx+ry*ry);
                                pixels[i++] = 255*(1-y/diameter);
                                pixels[i++] = 255*(1-y/diameter);
                                pixels[i++] = 255*(1-y/diameter);
                                pixels[i++] = Math.abs(y-radius)>(radius-(width/2)) ? (d>(width/2)?0:255) : 255;
                            }
                        }
                        this.barbg = imageData;
                        cc.putImageData(this.barbg, 0, 0);
                        this.drawCursors();
                    };
                    this.beginDragging = function(e) {
                        // console.log("wheel begin dragging");
                        var interceptor = newInterceptor(this);
                        interceptor.onMouseUp = function(e) {
                            destroyInterceptor();
                            this.inputObj.endDragging(e);
                        };
                        interceptor.onMouseMove = function(e) {
                            interceptor.inputObj.dragging(e)
                        };
                        this.onBeginDragging();
                        this.dragging(e);
                    };
                    this.dragging = function(e) {
                        // console.log("wheel dragging");
                        var x = e.clientX-this.rect.left-this.padding;
                        var y = e.clientY-this.rect.top-this.padding;
                        var rx = x-radius,
                            ry = y-radius,
                            d = Math.sqrt(rx*rx+ry*ry);

                        if (d > this.radius) {
                            var theta = Math.atan2(y, x);
                            x = this.radius * Math.cos(theta);
                            y = this.radius * Math.sin(theta);
                            theta = Math.atan2(y, x);
                            d = Math.sqrt(x*x+y*y);
                        }
                        this.sethsv(
                            90+360*(Math.atan2(ry, rx) + Math.PI) / (Math.PI*2),        // Hue
                            100*d / this.radius,                                        // Saturation
                            this.v                                                      // Value
                        );
                        this.drawCursor();
                        this.onDragging();
                        this.onChange();
                    };
                    this.endDragging = function(e) {
                        // console.log("wheel end dragging");
                        //idk yet
                        this.onEndDragging();
                    };
                    this.beginSliding = function(e) {
                        // console.log("wheel begin sliding");
                        var interceptor = newInterceptor(this);
                        interceptor.onMouseUp = function(e) {
                            destroyInterceptor();
                            this.inputObj.endSliding(e);
                        };
                        interceptor.onMouseMove = function(e) {
                            interceptor.inputObj.sliding(e)
                        };
                        this.onBeginSliding();
                        this.sliding(e);
                    };
                    this.sliding = function(e) {
                        // console.log("wheel sliding");
                        var v = e.clientY < this.barRect.top+this.padding ? 0 : (e.clientY >  this.barRect.top + this.barRect.height - 2*this.padding ? 100 : (e.clientY - this.barRect.top - this.padding)*100/(this.barRect.height-this.padding*2));
                        this.v = 100-v;
                        this.drawSlider();
                        this.onSliding();
                        this.onChange();
                    };
                    this.endSliding = function(e) {
                        // console.log("wheel end sliding");
                        //idk yet
                        this.onEndSliding();
                    };
                    this.drawCursors = function(valueOrX=null,y=null,v=null){
                        if(y==null||v==null){
                            if(valueOrX!=null){
                                var hsv = rgb2hsv(parseInt(valueOrX.slice(1,3),16),parseInt(valueOrX.slice(3,5),16),parseInt(valueOrX.slice(5,7),16));
                            }else{
                                var hsv = this.gethsv();
                            }
                            var x = this.radius*Math.cos(2*Math.PI*(90+hsv.h)/360)*hsv.s/100;
                            var y = this.radius*Math.sin(2*Math.PI*(90+hsv.h)/360)*hsv.s/100;
                        }
                        this.drawCursor(x,y);
                        this.drawSlider(v);
                    };
                    this.drawCursor = function(valueOrX=null,y=null){
                        var x = valueOrX;
                        if(y==null){
                            if(valueOrX!=null){
                                var hsv = rgb2hsv(parseInt(valueOrX.slice(1,3),16),parseInt(valueOrX.slice(3,5),16),parseInt(valueOrX.slice(5,7),16));
                            }else{
                                var hsv = this.gethsv();
                            }
                            var x = this.radius*Math.cos(2*Math.PI*(90+hsv.h)/360)*hsv.s/100;
                            var y = this.radius*Math.sin(2*Math.PI*(90+hsv.h)/360)*hsv.s/100;
                        }
                        x+=this.padding;
                        y+=this.padding;
                        // console.log("cursor at: "+x+", "+y);
                        var cc = this.element.getContext('2d');
                        cc.putImageData(this.bg, 0, 0);
                        cc.beginPath();
                        cc.strokeStyle = '#000000';
                        cc.fillStyle = '#ffffff';
                        cc.arc(Math.floor(x+this.radius)*(this.quadres?2:1),Math.floor(y+this.radius)*(this.quadres?2:1), 3*(this.quadres?2:1), 0, Math.PI*2);
                        cc.fill();
                        cc.stroke();
                    };
                    this.drawSlider = function(v=null){
                        if(v==null){
                            v = this.v;
                        }
                        // console.log("v: "+v);
                        v = (this.barRect.height-this.padding*2)*(1-v/100);
                        // console.log("slider at: "+v)
                        var cc = this.barElement.getContext('2d');
                        cc.putImageData(this.barbg, 0, 0);
                        cc.beginPath();
                        cc.strokeStyle = '#000000';
                        cc.fillStyle = '#ffffff';
                        cc.arc(Math.floor(this.barRect.width/2)*(this.quadres?2:1),Math.floor(v+this.padding)*(this.quadres?2:1), 3*(this.quadres?2:1), 0, Math.PI*2);
                        cc.fill();
                        cc.stroke();
                    };
                }

                function newColorWheel(target, value='#ffffff', radius, padding, quadres=true){
                    var wheel = new ColorWheel(radius, padding, quadres);
                    target.appendChild(new Range().createContextualFragment(''
                        + '<canvas class="wheelCanvas"></canvas>'
                        + '<canvas class="barCanvas"></canvas>'));
                    wheel.element = target.getElementsByClassName("wheelCanvas")[0];
                    wheel.barElement = target.getElementsByClassName("barCanvas")[0];
                    wheel.redraw();
                    wheel.setrgb(parseInt(value.slice(1,3),16),parseInt(value.slice(3,5),16),parseInt(value.slice(5,7),16));
                    wheel.element.addEventListener("mousedown", function(e) {
                        wheel.beginDragging(e);
                    });
                    wheel.barElement.addEventListener("mousedown", function(e) {
                        wheel.beginSliding(e);
                    });
                    return wheel;
                }
            }
        }
