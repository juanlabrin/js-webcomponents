<h2>Triple Slide Show - JavaScript Web Component</h2>
<h3>Basic setup and use.</h3>

<p>You must create a tag in the file that will contain the component named:</p>

```html
<triple-slide-show>
```
<p>It has only two required attributes 'images' and 'path'.

```html
<triple-slide-show images='["agroindustria-app.jpg", "metalurgica-app.jpg","sistemaerp-app.jpg"]', path='/images/'>
```
</p>
<p>You can define the configuration and the columns definitions, like this:</p>

```html
<!-- Include the component -->
<script type='module' src='/js/triple-slide-show/triple-slide-show.class.js'></script>
```