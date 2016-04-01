# Select Buttons

A simple replacement for SELECTs or INPUT groups (type checkbox / radio). All options are always visible as buttons.
These buttons has two states, checked and unchecked, making easy to user understand the state of his options.
Mount it from an array of options or based in a SELECT element.

You can...

 * work with multiple checkable buttons
 * preserve at least one checked button
 * work with some disabled buttons

There are methods to...

 * check all buttons
 * uncheck all buttons
 * invert selection
 * get selected values

### Sample code:

HTML
```html
<input type="hidden" id="colors">
<select id="names" multiple>
  <option value="João">João</option>
  <option value="Maria" selected>Maria</option>
  <option value="Paula">Paula</option>
  <option value="Joana">Joana</option>
</select>
```
Javascript
```javascript
$(function(){	
	$('#names').selectButtons();
	$('#colors').selectButtons({
		options: ['Blue', 'Yellow', 'Green', {label: 'My color', value: 'Red'}], 
		noEmpty: true, 
		multiple: true,
		selectedIndexes: [0]
	});	
});
```

This is [on GitHub](https://github.com/caugbr/select-buttons/)