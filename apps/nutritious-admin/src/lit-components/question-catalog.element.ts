import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';


@customElement('question-catalog-element')
export default class QuestionCatalogElement extends LitElement {
	@property()
	version = 'STARTING';

	override render() {
		return html`
      <p>Welcome to the Lit tutorial!</p>
      <p>This is the ${this.version} code.</p>
    `;
	}
}
