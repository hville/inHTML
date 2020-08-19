<!-- markdownlint-disable MD004 MD007 MD010 MD041 MD022 MD024 MD032 MD036 -->
# inHTML

*small in-HTML DOM utils, < 1kb*

• [Features](#features) • [Limitations](#limitations) • [API](#api) • [License](#license)

```html
<body>
  <script src='./inhtml.js'>
    //must be loaded first
  </script>
	<table>
    <template>
      <tr id=row>
        <td><a id=label></td>
      </tr>
    </template>
		<script>
			inHTML( function(table, {row}) {
				function updateRow(v) {
					this.refs.label.textContent = v.ms
				}
				function makeRow(rec) {
          const el = inHTML.clone(row)
          el.update = updateRow
          el.update(rec)
					return el
				}
				inHTML.refs.rows = inHTML.list(table, v=>v.id, makeRow)
			})
		</script>
  </table>
  <script>
    inHTML.refs.rows.update([ {id:'1', ms:'one'} ])
  </script>
</body>
```

## Features

* template inside html markup
* no new html constructs
* no virtual DOM, all operations are done on actual nodes
* multiple dynamic lists within the same parent
* synthetic events available
* < 1kb gzip, no dependencies
* very low memory requirement

## Limitations

* strictly DOM element creation and manipulations (no router, no store)
* no IE (relies on template element)
* for browsers only

## API

* `inHTML( callback ): void`
  * called directly in a script tag, directly after the element to operate on
  * if a template is found, extract template child elements with ids
  * `callback: (previousElement: Element, templates: {id: Element}) => void`
* `inHTML.data: {}`
  * state placeholder to minimize globals
* `inHTML.refs: {}`
  * element references placeholder to minimize globals
* `inHTML.clone( model:Element ): Element`
  * deep clone of the template element
  * all children with ids are striped of their ids and stored in clone.refs
* `inHTML.delegate(event: String): void`
  * event delegation for `onEvent`. For example, `click` will act on elements with an `onClick` property
* `inHTML.list(parent, getKey, factory, after=null, before=null): {update: array=>this}`
  * creates a `List` object with an update method that can update the parent children to match a data Array
  * `parent: Element` the parent element to hold the list
  * `getKEy: (v,i)=>string` to extract a unique key from the data
  * `factory: (v,i)=>Element` to create new child elements in the list with an `update` property
  * `after: null|Element` optional, used if the list is after an existing child element to be maintained
  * `before: null|Element` optional, used if the list is before an existing child element to be maintained

## License

[MIT](http://www.opensource.org/licenses/MIT) © [Hugo Villeneuve](https://github.com/hville)
