// @autor Juan P. Labrin
console.info("Simple Rich Text Editor");
const template = `
    <div class="rich-text-editor">
        <div class="rte-header">
            <div class="rte-menu">
                <div class="btn-group">
                    <select role="select" class="btn" id="formatBlock">
                        <option value="">Select a heading</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                        <option value="h5">Heading 5</option>
                        <option value="h6">Heading 6</option>
                    </select>
                    <button role="button" class="btn" id="formatBlock" value="p">Paragraph</button>
                    <button role="button" class="btn" id="bold" value="">Bold</button>                    
                    <button role="button" class="btn" id="selectAll" value="">Select</button>
                    <button role="button" class="btn" id="insertHTML" value="code">Code</button>
                </div>
            </div>
        </div>
        <div class="rte-body">
            <iframe id="rte-editor"></iframe>
        </div>
        <div class="rte-footer">
            <button role="action" class="btn" id="btn-save" value="">Save</button>
        </div>
    </div>
    `;
let rte = document.getElementById('rich-text-editor');
rte.innerHTML = template;
window.addEventListener("load", function () {


    let iframe = document.getElementById('rte-editor');
    let iframeDoc = iframe.contentDocument;

    iframeDoc.designMode = "On";
    iframe.focus();

    let btns = document.querySelectorAll('.btn');
    let btnSave = document.getElementById('btn-save');

    btns.forEach(btn => {
        if (btn.getAttribute('role') === "button") {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                // console.log('id:', this.id);
                // console.log('value:', this.value);

                if (this.id === "formatBlock") {
                    iframeDoc.execCommand(this.id, false, this.value);
                } else if (this.id === "insertHTML") {
                    if (this.value === "code") {
                        let text = iframeDoc.getSelection().toString();
                        let code = `<code>${text}</code>`;
                        iframeDoc.execCommand(this.id, false, code);
                    }
                } else {
                    iframeDoc.execCommand(this.id, false, null);
                }

            });
        }
        if (btn.getAttribute('role') === "select") {
            btn.addEventListener('change', function (e) {
                e.preventDefault();
                // console.log('id:', this.id);
                // console.log('value:', this.value);

                iframeDoc.execCommand(this.id, false, this.value);
            });
        }
    });

    //     btnSave.addEventListener('click', function(e){
    //         e.preventDefault();
    //         console.info('Save Rich Text');
    //         console.log(Encoder.htmlEncode(rte.contentDocument.body.innerHTML));
    //         console.log(Encoder.htmlDecode(rte.contentDocument.body.innerHTML));
    //     });

});

// window.onload = function () {

//     const btns = document.querySelectorAll('.btn');
//     const btnSave = document.getElementById('btn-save');

//     btns.forEach(btn => {
//         if (btn.getAttribute('role') === "button") {
//             btn.addEventListener('click', function (e) {
//                 e.preventDefault();
//                 // console.log('id:', this.id);
//                 // console.log('value:', this.value);

//                 if (this.id === "formatBlock") {
//                     rte.contentDocument.execCommand(this.id, false, this.value);
//                 } else if (this.id === "insertHTML") {
//                     if (this.value === "code") {
//                         let text = rte.contentDocument.getSelection().toString();
//                         let code = `<code>${text}</code>`;
//                         rte.contentDocument.execCommand(this.id, false, code);
//                     }
//                 } else {
//                     rte.contentDocument.execCommand(this.id, false, null);
//                 }

//             });
//         }
//         if (btn.getAttribute('role') === "select") {
//             btn.addEventListener('change', function (e) {
//                 e.preventDefault();
//                 console.log('id:', this.id);
//                 console.log('value:', this.value);

//                 rte.contentDocument.execCommand(this.id, false, this.value);
//             });
//         }
//     });

//     btnSave.addEventListener('click', function(e){
//         e.preventDefault();
//         console.info('Save Rich Text');
//         console.log(Encoder.htmlEncode(rte.contentDocument.body.innerHTML));
//         console.log(Encoder.htmlDecode(rte.contentDocument.body.innerHTML));
//     });
// }