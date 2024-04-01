const template = document.createElement('template');
template.innerHTML = `
    <style>
    @media(min-width: 360px) {

        img {
            position: absolute;
            object-fit: cover;
            height: 100%;
            width: 100%;
            left: 0;
        }
        .tss-box {
            display: grid; 
            height: 300px;
            margin-bottom: 1rem;
        }
        .item-a, .item-b, .item-c {
            position: relative;
            background-color: lightgray;
        }
        .item-b, .item-c {
            display: none;
        }

    }

    @media(min-width: 760px){

        .tss-box {
            width: 700px; 
            height: 350px; 
            grid-template-columns: [lcol] 60% [rcol] 40%; 
            grid-template-rows: [trow] 50% [brow] 50%; 
            gap: 1rem;
        }

        .item-a {
            grid-column-start: 1;
            grid-column-end: 2;
            grid-row-start: 1;
            grid-row-end: 3;
        }

        .item-b, .item-c {
            display: block;
        }

    }
    </style>
    <div class="tss-box">
        <div class="item-a"></div>
        <div class="item-b"></div>
        <div class="item-c"></div>
    </div>
`;

class TripleSlideShow extends HTMLElement {

    #shadowRoot;
    #intervalIds = [];
    #items = [];

    $tssBox;
    $images;
    $path;

    constructor() {
        super();
        this.#shadowRoot = this.attachShadow({ mode: 'open' });
        this.#shadowRoot.appendChild(template.content.cloneNode(true));
        this.$tssBox = this.#shadowRoot.querySelector('.tss-box');
        this.#items = this.#shadowRoot.querySelectorAll('[class*="item-"]');
    }

    get images() {
        return this.getAttribute('images');
    }

    get path() {
        return this.getAttribute('path');
    }

    #_setPlaceHolders() {
        this.$tssBox.querySelector('.item-a').appendChild(this.#_createImagePlaceHolder(640, 480, 'red', 'Item a - img 1'));
        this.$tssBox.querySelector('.item-a').appendChild(this.#_createImagePlaceHolder(640, 480, 'blue', 'Item a - img 2'));
        this.$tssBox.querySelector('.item-a').appendChild(this.#_createImagePlaceHolder(640, 480, 'green', 'Item a - img 3'));

        this.$tssBox.querySelector('.item-b').appendChild(this.#_createImagePlaceHolder(640, 480, 'blue', 'Item b - img 2'));
        this.$tssBox.querySelector('.item-b').appendChild(this.#_createImagePlaceHolder(640, 480, 'green', 'Item b - img 3'));
        this.$tssBox.querySelector('.item-b').appendChild(this.#_createImagePlaceHolder(640, 480, 'red', 'Item b - img 1'));

        this.$tssBox.querySelector('.item-c').appendChild(this.#_createImagePlaceHolder(640, 480, 'green', 'Item c - img 3'));
        this.$tssBox.querySelector('.item-c').appendChild(this.#_createImagePlaceHolder(640, 480, 'red', 'Item c - img 1'));
        this.$tssBox.querySelector('.item-c').appendChild(this.#_createImagePlaceHolder(640, 480, 'blue', 'Item c - img 2'));
    }

    #_createImagePlaceHolder(w, h, color, text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;

        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = "bold 1.5rem sans-serif";
        context.fillStyle = "#AAA";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`${text}`, canvas.width / 2, canvas.height / 2);

        const image = new Image();
        image.src = canvas.toDataURL();

        return image;
    }

    #_slideShowByItem(item, event) {
        let images = this.#shadowRoot.querySelectorAll(`${item} img`);
        //- console.log(images);

        for (let i = 0; i < images.length; ++i) {
            images[i].style.opacity = 1;
        }

        let top = 1;
        let cur = images.length - 1;

        this.#intervalIds.push(setInterval(changeImage, 3000));

        async function changeImage() {
            let nextImage = (1 + cur) % images.length;
            images[cur].style.zIndex = top + 1;
            images[nextImage].style.zIndex = top;

            await transition();

            images[cur].style.zIndex = top;
            images[nextImage].style.zIndex = top + 1;
            top = top + 1;
            images[cur].style.opacity = 1;
            cur = nextImage;
        }

        function transition() {
            return new Promise(function (resolve, reject) {
                let del = 0.01;
                let id = setInterval(changeOpacity, 10);

                function changeOpacity() {
                    images[cur].style.opacity -= del;
                    if (images[cur].style.opacity <= 0) {
                        clearInterval(id);
                        resolve();
                    }
                }

            });
        }
    }

    #_setImages() {
        for (let i = 0; i < this.$images.length; i++) {

            for (let j = 0; j < this.$images.length; j++) {
                let img = new Image();
                img.src = `${this.$path}${this.$images[j]}`;
                img.style.cursor = 'pointer';
                img.addEventListener('click', (e) => {
                    document.location = '#products';
                });
                this.#items[i].appendChild(img);
            }

            this.$images.push(this.$images.splice(0, 1)[0]);
        }
    }

    #_windowOnBlur() {
        //- console.log('blur');
        if (this.#intervalIds.length > 0) {
            //- console.log(this.#intervalIds);
            for (const id of this.#intervalIds) {
                clearInterval(id);
            }
            this.#intervalIds = [];
        }
    }

    #_windowOnFocus() {
        //- console.log('focus');
        this.#_slideShowByItem('.item-a');
        this.#_slideShowByItem('.item-b');
        this.#_slideShowByItem('.item-c');
    }

    connectedCallback() {
        console.log('TSS Connected!');

        if (this.hasAttribute('images') && this.hasAttribute('path')) {
            this.$images = JSON.parse(this.images);
            this.$path = this.path;
            this.#_setImages();
        } else {
            this.#_setPlaceHolders();
        }

        window.addEventListener('blur', this.#_windowOnBlur.bind(this));
        window.addEventListener('focus', this.#_windowOnFocus.bind(this));

        if (this.#intervalIds.length > 0) {
            //- console.log(this.#intervalIds);
            for (const id of this.#intervalIds) {
                clearInterval(id);
            }
            this.#intervalIds = [];
        }

        if (navigator.userAgent.indexOf("Chrome") != -1) {
            this.#_slideShowByItem('.item-a');
            this.#_slideShowByItem('.item-b');
            this.#_slideShowByItem('.item-c');
        }
    }
}

window.customElements.define('triple-slide-show', TripleSlideShow);