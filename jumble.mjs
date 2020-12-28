//From <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random>
/** Returns random int in [min, max) */
function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}

function randPerm(elements) {
  const n = elements.length;
  const perm = Array.from(elements);
  //uses Knuth shuffle:
  //<https://en.wikipedia.org/wiki/Random_permutation#Knuth_shuffles>
  for (let i = 0; i < n - 1; i++) {
    const j = randInt(i, n);
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }
  return perm;
}

function inversionCount(perm) {
  const inversion = (i, p) => p.slice(0, i).filter(e => e > i).length;
  const inversions = p => p.map((_, i) => inversion(i, p));
  const count = inversions(perm).reduce((acc, e) => acc + e, 0);
  return count;
}

function jumbleWord(word) {
  const n = word.length;
  if (n <= 1) return word;
  else if (n === 2) return word[1] + word[0];
  else {
    let perm = [... new Array(n).keys()];
    do { perm = randPerm(perm) } while (inversionCount(perm) < n/3);
    const chars = word.split('');
    return perm.map(i => chars[i]).join('');
  }
}



function jumblePhrase(phrase, preserveWords) {
  const trimmed = phrase.replace(/^\W+/, '').replace(/\W+$/, '');
  if (preserveWords) {
    return [...phrase.matchAll(/(\w+)(\W*)/g)]
      .map(e => `${jumbleWord(e[1])}${e[2]}`)
      .join('');
  }
  else {
    return jumbleWord(phrase.toLowerCase().replace(/\W/g, ''));
  }
}

function makeElement(tag, attr={}) {
  const element = document.createElement(tag);
  Object.entries(attr).forEach(([k, v]) => element.setAttribute(k, v));
  return element;
}


const STYLE = `
  span.init, span.hinted {
    font-family: 'Maven Pro', sans-serif;
  }
  button {
    font-family: 'Maven Pro', sans-serif; 
    font-size: 20px;
    width: 10em; 
    vertical-align: baseline;
    margin-bottom: 4px;
    border-radius: 5px;
    color: inherit;
    background-color: inherit;
    border: 2px solid var(--color09);
  }
  .wrap {
    display: inline-block;
    min-width: 15em;
  }    
  .wrapper {
    margin: 10px;
    border: 2px solid var(--color09);
    border-radius: 10px;
    display: inline-block;
    padding: 4px;
    width: 12em;
  }
  .solved {
    font-family:  'Kaushan Script', cursive;
  }
`;
class JumblePhrase extends HTMLElement {
  constructor() {
    super();
    this.state = 'init';
    const phrase = this.getAttribute('phrase');
    const category = this.getAttribute('category');
    const initPhrase = this.initPhrase = jumblePhrase(phrase);
    const hinted = jumblePhrase(phrase, true);
    const doHint = (initPhrase !== hinted || category);
    this.hinted = (doHint)  ? hinted : undefined;
    this.solved = phrase;
    const wrapper = makeElement('span', {class: 'wrapper'});
    const wrap = makeElement('span', {class: 'wrap' });
    wrapper.appendChild(wrap);
    const categoryElement = this.category =
	  makeElement('em', { class: 'category' });
    categoryElement.textContent = ' ';
    wrap.appendChild(categoryElement);
    const text = this.text =
      makeElement('span', { class: this.state, id: 'text' });
    text.textContent = initPhrase;
    wrap.appendChild(text);
    const control = this.control =
      makeElement('button', { class: this.state,
			      type: 'button',
			      id: 'control' });
    control.textContent = doHint ? 'Hint' : 'Solve';
    control.onclick = this.onClick.bind(this);
    wrapper.appendChild(control);
    const shadow = this.attachShadow({mode: 'open'});
    const style = makeElement('style');
    style.textContent = STYLE;
    shadow.appendChild(style);
    shadow.appendChild(wrapper);
  }

  nextState() {
    return (this.state === 'init' && this.hinted)
      ? 'hinted'
      : 'solved';
  }

  onClick() {
    const state = this.state = this.nextState();
    this.text.textContent = this[state];
    this.text.className = state;
    if (state === 'hinted') {
      const category = this.getAttribute('category');
      if (category) this.category.textContent = `${category}: `;
      this.control.textContent = 'Solve';      
    }
    if (state === 'solved') this.control.remove();
  }

}

customElements.define('jumble-phrase', JumblePhrase);
	    
