<!-- markdownlint-disable MD004 MD007 MD010 MD041 MD022 MD024 MD032 MD036 -->
# inHTML

*small and simple in-html templates, factories and dynamic lists*

• [Features](#features) • [Limitations](#limitations) • [API](#api) • [License](#license)

```html
<table><tbody></tbody></table>
<template>
	<tr :id=row>
		<td :id=cell></td>
		<td><a :id=label></a></td>
	</tr>
</template>
<script type=module>
	import {cast, list} from '/index.js'
	const makeRow = cast('template', ({row, cell, label},v,k) => {
		label.textContent = v.ms
		cell.textContent = v.id
		row.update = v => label.textContent = v.ms
		return row
	})
	const tbody = list($('tbody'), makeRow)
	const data = [ {id:'1', ms:'one'} ]
	tbody.update(data)
	data.push( {id:'2', ms:'two'} )
	tbody.update(data)
</script>
```

## Features

* template inside html markup
* no new html constructs except for the `:id` custom attribute that is stripped when processed
* template can be a `<template>` element or any other node
* template is cloned, never modified
* multiple dynamic lists within the same parent

## Limitations

* strictly DOM element creation and manipulations (no router, no store)
* browsers only

## API

* `cast( source, decorator ): nodeFactory`
  * source: node or selector
  * decorator: (ids, ...args) => node|void, ids are striped from the clone's :id attribute
  * nodeFactory: (,,,args) => decorated clone
* `list( parent, childFactory, options): parent`
  * adds parent.update(value, key) method to the parent

## License

[MIT](http://www.opensource.org/licenses/MIT) © [Hugo Villeneuve](https://github.com/hville)
